/* Settings managers, rethought (Fable 5.2): five pages of the chapter "Code & tools", about the assistant doing real
   work on your project: checking that it works (Testing), finding out why it does not (Debugging), looking at it
   (Built-in browser), packing it into a container (Containers) and putting it online (Publishing an app).
   Today these are Testing & Debug (five tabs), Browser & SCM (filed under Source Control) and Containers (70 rows on
   one page). A newcomer knows none of these words, so every page opens by saying what the thing is for and how it
   stands in their own project, and Containers and Publishing say first that nothing there is required of them.
   - a test profile, a debug profile, a recording kept from a test, a website the browser stays signed in to, a place
     images are sent to and the Unraid store listing each have a page of their own;
   - "when tests run" is one list of four moments; a test profile's page reads that list instead of keeping a copy;
   - the browser page says what the assistant can see and send as "it may / it asks you first / it never does", and
     each line carries the real control, so changing one moves the line to the group it now belongs to;
   - the items PMConcept7 keeps in a "More actions" menu (Edit, Duplicate, Make default, Delete) are ordinary buttons
     here. Each one runs that menu's own item, so the panel, the question and the message are PMConcept7's.
   Every flow is PMConcept7's own; the buttons carry its action names. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  const enc = encodeURIComponent;
  const count = (n, one, many) => d.plural(n, one, many);
  const select = (value, options, o) => { try { return kit().dropdown(value, options, o); } catch (e) { return ''; } };
  const toggle = (on, o) => { try { return kit().toggle(on, o); } catch (e) { return ''; } };
  const seg = (value, options, o) => { try { return kit().segmented(value, options, o); } catch (e) { return ''; } };
  const stepList = (list) => { try { return kit().steps(list.filter(Boolean)); } catch (e) { return ''; } };
  const val = (id) => SMX.val(id);
  const txt = (id) => { try { const s = kit().setting(id); return s ? String(kit().valueText(s, kit().value(id))) : ''; } catch (e) { return ''; } };
  const lower = (s) => String(s || '').charAt(0).toLowerCase() + String(s || '').slice(1);
  const btnRow = (...b) => `<div class="smx-btn-row smx-cw-foot">${b.filter(Boolean).join('')}</div>`;
  const gone = (what, to, label) => [{ key: 'gone', html: ui.card({ title: `${what} is no longer there`, body: ui.btn({ label, go: to }) }) }];
  const newNote = (text) => `<p class="smx-new-note">${SMX.icon('info')}<span>${h(text)}</span></p>`;

  /* ------------------------------------------------------------------ ids */
  const POLICY = 'planning.testing.capability-policy', PM = 'branching.worktrees.pre-merge-tests', SESSION = 'planning.testing.session-actions';
  const cap = (k) => 'planning.testing.cap-' + k;
  const IN_BROWSER = ['planning.testing.test-visibility', cap('built-in-browser'), cap('screenshot-compare'), cap('console-network'), cap('accessibility')];
  const IN_APPS = [cap('desktop-gui'), cap('live-preview'), cap('hot-reload'), cap('simulator'), cap('physical-device')];
  const BEHIND = [cap('api-contract'), cap('database'), cap('performance'), cap('security')];
  const TOOLS = [cap('online-research'), cap('auto-install'), cap('visible-browser'), cap('headed-browser')];
  const MERGE_MORE = ['branching.worktrees.pre-merge-test-command', 'branching.worktrees.pre-merge-test-timeout', 'branching.worktrees.pre-merge-test-target'];
  const GRANT = 'safety.approvals.debug-grant-scope', DEBUG_LIST = 'code.execution.debug-configurations';
  const POINT = 'general.interaction.browser-capture', PROFILE = 'web.fetch.browser-session-profile', SAVE = 'web.fetch.browser-save-session', DEVTOOLS = 'planning.testing.browser-devtools-policy';
  const RETAIN = 'branching.worktrees.evidence-retention-days', REDACT = 'safety.protection.screenshot-redaction';
  const X = 'code.execution.';
  const HUB_IN = X + 'dockerhub-signin', HUB_NEW = X + 'create-repository', REGS = X + 'registry-credentials', DEFREG = X + 'default-registry', PUSH = X + 'push-policy';
  const REPO_SETUP = X + 'unraid-repo-setup', REPO_CHECK = X + 'unraid-review-state', UNRAID_ON = X + 'unraid-generate-xml';
  const LISTING = ['app-template-name', 'app-template-overview', 'app-template-webui', 'app-template-categories', 'app-template-config-items'].map((k) => X + k);
  const PUBLISHER = ['maintainer-profile-scope', 'maintainer-name', 'maintainer-about', 'maintainer-support-url', 'maintainer-icon', 'maintainer-slug'].map((k) => X + k);

  /* PMConcept7's rows keep their ids, values and controls; a few of their words are replaced so that a newcomer can
     read them and so that one thing has one name (X1 R-37, R-39; A7 N-3; A9 N-3). */
  if (SMX.reword) SMX.reword({
    [cap('console-network')]: { label: 'Watch for hidden errors', help: 'Errors a visitor never sees on the page, but that usually mean something broke.' },
    [cap('api-contract')]: { label: 'The app’s server side (API checks)', help: 'Sends your app test requests and checks that the answers are right.' },
    [cap('database')]: { help: 'Checks that data is really saved and changed the way it should be.' },
    [cap('live-preview')]: { help: 'Tests desktop app screens in a preview window while they change.' },
    [cap('hot-reload')]: { help: 'The app is refreshed as the code changes, so a test always sees the latest version.' },
    [cap('online-research')]: { help: 'Lets it look at official sources to pick the right testing tools.' },
    'branching.worktrees.pre-merge-test-command': { label: 'The project’s test command', help: 'What is run before a merge. Leave it empty and it is found in the project.' },
    'branching.worktrees.pre-merge-test-timeout': { label: 'Give up after', help: 'Between 30 and 1800 seconds. A test that runs longer counts as failed.' },
    'branching.worktrees.pre-merge-test-target': { help: 'The result after merging checks your work together with everything that changed in the meantime, so clashes are caught early.' },
    [GRANT]: { label: 'It may, without asking each time', help: 'Tick what it may repeat as often as it needs while it looks for the cause. Anything else it asks for, one step at a time.' },
    'safety.approvals.debug-profile-disclosure': { label: 'What it is allowed right now', help: 'Shows whether these permissions are in force, which ones, and when they run out.', action: 'Show them' },
    'general.startup.refresh-investigation': { label: 'Check the debug profile again when a debugging chat is picked up', help: 'Catches a program or a debugger that changed since the chat was left.' },
    'safety.approvals.debug-max-browser-branches': { label: 'Pages it may try at the same time', help: 'How many browser pages it may open at once while it looks for the cause.' },
    'safety.approvals.debug-max-no-evidence-loops': { label: 'Stop after this many tries with nothing new', help: 'So a search for the cause ends instead of going round in circles.' },
    [PROFILE]: { label: 'Between uses, the browser', help: 'Keeping a profile means its history and sign-ins are there the next time, for this project only. A window where you type a password never keeps anything.' },
    'planning.testing.browser-capture-full-default': { label: 'The screenshot button takes', help: 'Only the part of the page you can see, or the whole page from top to bottom.' },
    'planning.testing.browser-component-action': { label: 'After you pick something on a page', help: 'Send it to the chat at once, add it to the message you are writing, or put it where your cursor is.' },
    'planning.testing.browser-component-crop': { label: 'Send a close-up picture with it', help: 'A picture of only the thing you picked goes along with its details.' },
    [X + 'container-runtime']: { help: 'The program that runs containers on this computer. Docker is the usual one.' },
    [X + 'docker-manager-visibility']: { help: 'The Docker Manager shows up once a project has a Dockerfile, the file that says how to pack it.' },
    [X + 'preferred-browser']: { label: 'Open your app in', help: 'The browser on your computer that opens an app running in a container. This is not the built-in browser.' },
    [X + 'port-forward-auto-open']: { label: 'When your app can be reached', help: 'A container makes the app reachable at an address on your computer. Puppet Master can offer to open it, open it at once, or stay quiet.' },
    [X + 'port-preference-order']: { help: 'Where it looks first for your app’s page.' },
    [X + 'stream-follow-default']: { help: 'Whether a container’s live log moves along with new lines, or waits until you start it.' },
    [X + 'container-shell-command']: { help: 'The command used when you open a terminal inside a running container. Empty uses the container’s own.' },
    [X + 'drift-sensitivity']: { help: 'How readily you are told that a running container no longer matches the files it was made from.' },
    [X + 'protected-assets']: { label: 'Never remove these', help: 'Images, containers or labels that cleanup must always leave alone.' },
    [X + 'k8s-context']: { help: 'The cluster this project talks to. “None chosen” leaves Kubernetes out entirely.' },
    [X + 'docker-display-context']: { label: 'The Docker Manager opens on', help: 'Which Docker setup it shows first when a computer has more than one.' },
    [X + 'receipt-retention']: { help: 'How long the record of what was done to containers is kept.' },
    [HUB_NEW]: { label: 'Create a Docker Hub repository', help: 'Makes a new place on Docker Hub for this project’s images.' },
    [X + 'dockerhub-auth-method']: { help: 'Paste a token you made on Docker Hub, or sign in through your browser.' },
    [X + 'dockerhub-namespace']: { help: 'Your own account, or a team you belong to.' },
    [X + 'dockerhub-repository']: { help: 'The repository on Docker Hub that this project’s images go into.' },
    [DEFREG]: { label: 'Images go to', help: 'The registry used when you do not name another.' },
    [PUSH]: { label: 'Send a finished image', help: 'Wait until you say so, or send every image as soon as it is built.' },
    [X + 'tag-templates']: { label: 'How versions are named', help: 'Each image gets a tag that tells versions apart. A pattern can use {version}, {timestamp} or {commit}.' },
    [X + 'build-platforms']: { help: 'The kinds of computer your app can be installed on. More kinds make each build slower.' },
    [X + 'build-context']: { label: 'Folder that is packed', help: 'Usually the project folder.' },
    [X + 'build-target-stage']: { help: 'Only for a Dockerfile with several stages: the one to build.' },
    [X + 'compose-file']: { help: 'Only if it is not in the usual place.' },
    [X + 'compose-project-name']: { label: 'Name of the group of containers', help: 'Taken from the folder’s name, or a name you choose.' },
    [X + 'drift-comparison-target']: { help: 'What a running container is compared with to see whether it changed.' },
    [X + 'drift-ignore-rules']: { help: 'Files and labels to leave out of the comparison, so that expected differences stop raising warnings.' },
    [X + 'cleanup-scan-cadence']: { help: 'How often Puppet Master looks for old images and containers that could go.' },
    [X + 'cleanup-aggressiveness']: { label: 'How much cleanup offers to remove', help: 'How far it goes when it lists old images, containers and volumes for you to remove.' },
    [X + 'show-build-advanced']: { label: 'Show extra build options in the Docker Manager', help: 'Adds the less common build arguments to its Build view.' },
    [X + 'follow-latest-publish']: { label: 'The Docker Manager follows the newest publish', help: 'Its views stay on what you published last.' },
    [X + 'k8s-log-defaults']: { help: 'How the live log of something running on Kubernetes starts. “Same as other live logs” follows the choice for containers.' },
    [UNRAID_ON]: { label: 'Bring the listing up to date after each publish', help: 'Each time an image is published, the app’s entry in the store is rewritten to match.' },
    [X + 'maintainer-profile-scope']: { help: 'One profile for all your projects, or one that only this project uses.' },
    [X + 'unraid-manage-repo']: { help: 'It keeps the folder layout tidy and saves each change for you.' },
    [X + 'unraid-auto-push']: { label: 'Send listing updates by themselves', help: 'Off: you look at each update and send it with one press.' }
  });

  /* ------------------------------------------------------------------ PMConcept7's "More actions" items, as buttons
     The menu of a test profile or a debug profile exists only while its manager is drawn (actions.json: callback:…).
     A button here opens that real menu on itself without showing it and presses the item it stands for, so Edit opens
     PMConcept7's own panel, Delete asks its own question and Make default gives its own message. The menu's title is
     the thing's name: if it is not the one the button is for, nothing is pressed. */
  const TST = { domain: 'code', ws: 'testing', manager: 'testing' };
  const moreSpec = (kind, id) => Object.assign({}, TST, { tab: kind === 'debug' ? 'debug' : 'profiles', select: { action: 'pm51-testing-pick', data: { manager: 'testing', id, kind } }, find: (b) => [...b.querySelectorAll('.pm51-detail-actions button, .pm51-detail button')].find((x) => (x.getAttribute('aria-label') || '').trim() === 'More actions') });
  const pressItem = (title, item) => {
    const pop = W.document.querySelector('.pm51-popout.pm51-menu'); if (!pop) return 0;
    const t = pop.querySelector('.pm51-popout-title'); if (!t || t.textContent.trim() !== title) return -1;
    const it = [...pop.querySelectorAll('.pm51-menu-item')].find((b) => ((b.querySelector('.pm51-popout-label') || b).textContent || '').trim() === item);
    if (!it) return -1; it.click(); return 1;
  };
  const runItem = async (el, kind, id, title, item) => {
    const root = W.document.documentElement; root.classList.add('smx-cw-item');
    let r = 0;
    try { if (await SMX.borrow(el, moreSpec(kind, id))) for (let i = 0; i < 16 && r === 0; i++) { r = pressItem(title, item); if (r === 0) await SMX.wait(60); } }
    finally { if (r !== 1) { try { kit().closePopouts(); } catch (e) { /* none open */ } } W.setTimeout(() => root.classList.remove('smx-cw-item'), 320); }
    if (r === -1) SMX.toast('Not done', 'That action could not be reached in this preview.', 'info');
    return r === 1;
  };
  /* after an item that makes or removes a thing: go to the new one, or leave the page of the one that is gone */
  const follow = (list, before, id, back, route) => {
    let n = 0;
    const t = W.setInterval(() => {
      const now = list(SMX.fresh()), here = SMX.route === route;
      const made = now.find((x) => !before.includes(x.id));
      if (made && here) { W.clearInterval(t); SMX.go(`${back}/${enc(made.id)}`); return; }
      if (!now.some((x) => x.id === id) && here) { W.clearInterval(t); SMX.go(back, { replace: true }); return; }
      if (++n > 160 || !here) W.clearInterval(t);
    }, 250);
  };
  const itemAct = (name, kind, list, back) => {
    SMX.warmers[name] = (el) => moreSpec(kind, el.getAttribute('data-id'));
    SMX.act(name, (el) => { const id = el.getAttribute('data-id'), item = el.getAttribute('data-item'), route = SMX.route, before = list(SMX.fresh()).map((x) => x.id); runItem(el, kind, id, el.getAttribute('data-title'), item).then((ok) => { if (ok && (item === 'Duplicate' || item === 'Delete')) follow(list, before, id, back, route); SMX.soon(120); }); });
  };

  /* ================================================================== Testing: readers */
  const profiles = (st) => st.testProfiles || [];
  const debugs = (st) => st.debugProfiles || [];
  /* the Testing manager fills in "browser" and "native" the first time it is drawn; until then its defaults apply */
  const T = (st) => { const x = (st.pm51 || {}).testing || {}; return { runs: x.runs || [], triggers: Object.assign({ afterEdits: 'Fast feedback', beforeCompletion: 'Thorough verification', manual: 'Release candidate', retry: 1, then: 'Ask me' }, x.triggers || {}), shots: (x.browser || {}).screenshots || 'On failure', runtime: !x.native || x.native.runtime !== false }; };
  const isDefault = (p) => p.status === 'default';
  const testOff = () => String(val(POLICY)) === 'Off';
  const MOMENTS = [
    { key: 'afterEdits', label: 'While it works', help: 'After each meaningful change. Quick checks, so a mistake is caught early.', runs: 'while it works' },
    { key: 'beforeCompletion', label: 'Before it calls a job done', help: 'The job is not reported as done until this passes.', runs: 'before a job is called done' },
    { key: 'manual', label: 'When you ask for a full run', help: 'Also when a release Goal starts.', runs: 'when you ask for a full run' }
  ];
  const momentsOf = (st, name) => MOMENTS.filter((m) => T(st).triggers[m.key] === name);
  const runsWhen = (st, p) => { const ms = momentsOf(st, p.name); return ms.length ? `Runs ${ms.map((m) => m.runs).join(' and ')}` : 'Runs only when you start it'; };
  const lastRun = (st, name) => { const runs = T(st).runs; const i = runs.findIndex((r) => r.profile === name); return i < 0 ? null : Object.assign({ index: i }, runs[i]); };
  const whenOf = (r) => String(r.time || '').replace(/\s*·\s*/, ' at ').replace(/^(Today|Yesterday)/, (m) => m.toLowerCase());
  const passed = (r) => /pass/i.test(String(r.result || ''));
  const runTone = (r) => (passed(r) ? 'ready' : /fail/i.test(String(r.result)) ? 'blocked' : /run/i.test(String(r.result)) ? 'info' : 'off');
  const runWord = (r) => (passed(r) ? 'Passed' : String(r.result || ''));
  const RETRIES = [['0', 'do not try again'], ['1', 'try once more'], ['2', 'try twice more'], ['3', 'try three more times']];
  const THENS = [['Ask me', 'ask me what to do'], ['Stop', 'stop the work'], ['Continue', 'carry on anyway']];
  const ANSWERS = [
    ['Auto', 'Automatic', 'It decides. A change to how something works gets tested; a spelling fix does not.'],
    ['On', 'Always test', 'Every change must be tested before the job counts as done.'],
    ['Off', 'Never test', 'It runs no tests, and nothing is reported as tested.']
  ];
  const WORKFLOWS = [['Settings navigation', 'Every chapter, page and short section'], ['Manager controls', 'Add, edit, check, reorder, turn off, remove'], ['Menus, dialogs and motion', 'Opening and closing, focus, no flashes'], ['Layouts at every width', 'Desktop, narrow and phone']];
  const capWord = (ids) => { const c = { Auto: 0, On: 0, Off: 0 }; ids.forEach((id) => { const v = String(val(id)); if (c[v] != null) c[v]++; }); return c.Auto === ids.length ? 'Automatic' : [c.Auto ? `${c.Auto} automatic` : '', c.On ? `${c.On} always` : '', c.Off ? `${c.Off} never` : ''].filter(Boolean).join(' · '); };

  /* what needs you, for this page and for Settings Home: only what is wrong with the setup itself */
  const testNeeds = (st) => {
    if (testOff()) return [];
    const t = T(st), names = profiles(st).map((p) => p.name), out = [];
    for (const m of MOMENTS) { const v = t.triggers[m.key]; if (v && v !== 'None' && !names.includes(v)) out.push({ title: `“${v}” is chosen for a moment, but that test profile no longer exists`, detail: `It was to run ${m.runs}. Nothing runs then until you choose another.`, fix: { label: 'Choose another', go: 'code/testing', anchor: 'when' } }); }
    if (!t.triggers.beforeCompletion || t.triggers.beforeCompletion === 'None') out.push({ title: 'Nothing is checked before a job is called done', detail: 'The assistant can report a job as finished without running a single test.', fix: { label: 'Choose a test profile', go: 'code/testing', anchor: 'when' } });
    return out;
  };
  (SMX.needSources = SMX.needSources || []).push(Object.assign((st) => [...testNeeds(st), ...failedGate(st)], { chapter: 'code' }));
  /* a run of the profile that guards "done" that failed: it needs you, but it is not a fault of the setup */
  const failedGate = (st) => { const t = T(st), r = lastRun(st, t.triggers.beforeCompletion); return r && !testOff() && /fail/i.test(String(r.result)) ? [{ tone: 'info', title: `${r.profile} ended with ${String(r.result).toLowerCase()} ${whenOf(r)}`, detail: 'A job is not called done until this test profile passes.', fix: { label: 'See what failed', action: 'pm51-testing-open-run', data: { index: r.index } } }] : []; };

  const profileItem = (st, p) => { const lr = lastRun(st, p.name); return { icon: 'flask', name: p.name, tag: isDefault(p) ? 'Default' : '', sub: p.description || '', sub2: `${runsWhen(st, p)} · ${count((p.stages || []).length, 'stage')}`, status: lr ? { text: passed(lr) ? 'Last run passed' : `Last run: ${String(lr.result).toLowerCase()}`, tone: runTone(lr) } : { text: 'Not run yet', tone: 'off' }, go: `code/testing/${enc(p.id)}`, side: ui.btn({ label: 'Run now', icon: 'play', action: 'pm51-testing-run', data: { id: p.id } }) }; };
  const runItemRow = (st, r, i) => ({ icon: 'history', name: r.profile, sub: `${whenOf(r).replace(/^./, (c) => c.toUpperCase())} · took ${r.duration}`, status: { text: runWord(r), tone: runTone(r) }, action: 'pm51-testing-open-run', data: { index: i } });

  /* PMConcept7's panel “No test session is running” ends in “Open History”, which only switches the old manager's
     tab. When that tab turns to History while this page is showing, the page that now holds the runs opens. */
  let seenTab = { tab: null, at: 0 };
  const followHistory = (st) => { const tab = (((st.pm51 || {}).tabs) || {}).testing || '', now = W.performance.now(); if (seenTab.tab !== null && now - seenTab.at < 4000 && seenTab.tab !== 'history' && tab === 'history') W.setTimeout(() => { if (SMX.route === 'code/testing') SMX.go('code/test-runs'); }, 0); seenTab = { tab, at: now }; };

  /* ================================================================== Testing */
  const testing = SMX.extend('code/testing', {
    purpose: 'A test is a check that your project still does what it should. The assistant can run tests on its own work before it tells you a job is done.',
    keywords: ['test', 'tests', 'testing', 'test profile', 'fail', 'failed', 'failing test', 'retry', 'flaky', 'merge', 'simulator', 'accessibility', 'check my work', 'does it work'],
    blurb: (ctx) => { const st = ctx.st, t = T(st), n = profiles(st).length; return testOff() ? 'Off: the assistant does not test its work' : `${count(n, 'test profile')} · ${t.triggers.beforeCompletion && t.triggers.beforeCompletion !== 'None' ? `${t.triggers.beforeCompletion} must pass before a job is done` : 'nothing has to pass before a job is done'}`; },
    status: (ctx) => { const st = ctx.st; if (testOff()) return { text: 'Off', tone: 'off' }; if (testNeeds(st).length) return { text: 'Needs you', tone: 'attention' }; const f = failedGate(st); return f.length ? { text: 'Last run failed', tone: 'attention' } : { text: 'Working', tone: 'ready' }; },
    lead: (ctx) => {
      const st = ctx.st, t = T(st), ps = profiles(st), pol = String(val(POLICY) || 'Auto');
      const gate = ps.find((p) => p.name === t.triggers.beforeCompletion);
      followHistory(st);
      return [
        { key: 'summary', html: ui.summary({ icon: 'flask', tone: pol === 'Off' ? 'off' : 'ready', lines: [
          pol === 'Off' ? `The assistant ${ui.b('does not test')} its work, so nothing is reported as tested.` : pol === 'On' ? `The assistant ${ui.b('must test')} every change before it calls the job done.` : `The assistant tests its own work ${ui.b('when the work calls for it')}.`,
          `${ui.b(count(ps.length, 'test profile'))} ${ps.length === 1 ? 'is' : 'are'} set up. ${gate ? `${ui.word(gate.name, { go: `code/testing/${enc(gate.id)}` })} has to pass before a job is called done.` : `${ui.word('Nothing', { go: 'code/testing', anchor: 'when' })} has to pass before a job is called done.`}`
        ] }) },
        { key: 'needs', html: ui.needs([...testNeeds(st), ...failedGate(st)]) },
        { key: 'may', html: ui.card({ title: 'May the assistant test its own work?', help: 'The first choice decides whether anything else on this page is used.', body:
          `<div class="smx-cw-answers" role="radiogroup" aria-label="May the assistant test its own work?" data-smx-covers="${POLICY}">${ANSWERS.map(([v, name, text]) => `<button type="button" class="smx-cw-answer${pol === v ? ' is-on' : ''}" role="radio" aria-checked="${pol === v}" data-action="set-setting" data-setting="${POLICY}" data-value="${v}" data-smx-key="answer-${v}"><span class="smx-cw-answer-name">${pol === v ? SMX.icon('check') : ''}${h(name)}${pol === v ? '<small>Chosen</small>' : ''}</span><span class="smx-cw-answer-text">${h(text)}</span></button>`).join('')}</div>`
          + (pol === 'Off' ? '' : ui.sentence(`<span>When a test fails,</span>${select(String(t.triggers.retry == null ? 1 : t.triggers.retry), RETRIES, { action: 'pm51-testing-trigger', data: { key: 'retry' }, label: 'After a failed test' })}<span>and if it still fails,</span>${select(t.triggers.then || 'Ask me', THENS, { action: 'pm51-testing-trigger', data: { key: 'then' }, label: 'If it still fails' })}`)
            + `<p class="smx-sentence-note">A test that only passes on a later try is reported as flaky. A test profile can have its own number of tries.</p>`) }) },
        { key: 'profiles', html: ui.things({ title: 'Your test profiles', help: 'A test profile is a list of stages: checks that run one after another. A failing stage stops the run.', add: { label: 'New test profile', action: 'pm51-testing-add-profile' }, items: ps.map((p) => profileItem(st, p)),
          empty: { icon: 'flask', title: 'No test profiles yet', text: 'Make one to decide what gets checked. Five questions, and the commands are found in your project.', fix: { label: 'New test profile', action: 'pm51-testing-add-profile' } } }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'eye', title: 'Watch a test that is running', sub: 'Open it, keep it in the background, or stop it', action: 'run-setting-action', data: { setting: SESSION } },
          { icon: 'history', title: 'See what past runs found', sub: 'Every run, and the recordings kept as proof', go: 'code/test-runs' },
          { icon: 'search', title: 'Find out why something fails', sub: 'Run your program with a debugger', go: 'code/debug' }
        ], { title: 'What do you want to do?', cols: 3 }) }
      ];
    },
    sections: [
      { key: 'when', html: (ctx) => {
        const st = ctx.st, t = T(st), names = profiles(st).map((p) => p.name);
        const opts = (v) => (v && v !== 'None' && !names.includes(v) ? [v] : []).concat(names).map((n) => [n, n]).concat([['None', 'None']]);
        const row = (m) => ({ label: m.label, help: m.help, control: select(t.triggers[m.key] || 'None', opts(t.triggers[m.key]), { action: 'pm51-testing-trigger', data: { key: m.key }, label: m.label }) });
        return ui.card({ title: 'When tests run', help: testOff() ? 'Testing is set to “Never test”, so none of these moments is used.' : 'Pick the test profile for each moment. “None” skips that moment.', body: ui.rows([row(MOMENTS[0]), row(MOMENTS[1]),
          { label: 'Before finished work is merged', help: 'Merging adds finished work to your main copy. The project’s own test command runs first, and a failure stops the merge.', covers: PM, control: ui.toggle(PM, { label: 'Test before merging' }) + ui.btn({ label: 'Details', ghost: true, go: 'code/testing', reveal: MERGE_MORE[0] }) },
          row(MOMENTS[2])]) });
      } },
      { key: 'kinds', html: () => {
        if (testOff()) return ui.card({ title: 'What it can test', body: ui.note('Testing is set to “Never test”, so no kind of test is used.', 'info') });
        const line = (label, help, ids, first) => ({ label, help, value: capWord(ids), control: ui.btn({ label: 'Change', go: 'code/testing', reveal: first || ids[0] }) });
        return ui.card({ title: 'What it can test', help: 'Each kind of test is used when the work calls for it, unless you set it to Always or Never.', body: ui.rows([
          line('In a browser', 'Clicks through your pages, compares pictures with the last run, watches for hidden errors and checks accessibility.', IN_BROWSER.slice(1)),
          line('Desktop and mobile apps', 'Opens the app’s window, a phone simulator or a real phone.', IN_APPS),
          line('Behind the scenes', 'The app’s server side, its data, its speed and its security.', BEHIND),
          { label: 'Test tools on this computer', help: 'The build tools and test runners these checks need.', status: ui.status('Ready', 'ready'), control: ui.btn({ label: 'Check them', icon: 'test', action: 'pm51-testing-check-tools' }) }
        ]) });
      } }
    ],
    more: [
      { key: 'in-browser', title: 'In a browser', help: 'For anything with a screen: web apps, documents, and Puppet Master itself.', ids: IN_BROWSER },
      { key: 'in-browser-links', html: () => (testOff() ? '' : ui.links([{ label: `Pictures during a test: ${lower((SHOTS.find((x) => x[0] === T(SMX.st()).shots) || [0, 'when something fails'])[1])}. Changed under Built-in browser`, go: 'code/browser', anchor: 'may' }])) },
      { key: 'in-apps', title: 'Desktop and mobile apps', help: 'App windows, simulators and real devices.', ids: IN_APPS },
      { key: 'behind', title: 'Behind the scenes', help: 'The parts of an app nobody sees.', ids: BEHIND },
      { key: 'service', html: (ctx) => (testOff() ? '' : ui.card({ title: 'The app’s background service', body: ui.rows([{ label: 'Test the service that runs in the background', help: 'Checks that it starts, keeps its connections and recovers after a failure.', control: toggle(T(ctx.st).runtime, { action: 'pm51-testing-native', data: { key: 'runtime' }, label: 'Runtime and service tests' }) }]) })), count: 1 },
      { key: 'merge', title: 'Before merging: the details', help: 'Used while “Before finished work is merged” is on.', ids: MERGE_MORE }
    ],
    moreHelp: 'Each kind of test, and the details of the check before merging',
    expert: [
      { key: 'tools', title: 'Test tools and windows', help: 'Finding and installing test tools, and how browser windows open during a test.', ids: TOOLS },
      { key: 'gates', html: (ctx) => { const st = ctx.st, t = T(st), on = val(PM) !== false, cmd = String(val(MERGE_MORE[0]) || ''); const name = (v) => (v && v !== 'None' ? v : 'no test profile'); return ui.card({ title: 'What stops what', body: ui.facts([
        ['Before a job is called done', `Held back until ${name(t.triggers.beforeCompletion)} passes`],
        ['Before merging', on ? `Runs ${!cmd || /auto/i.test(cmd) ? 'the test command found in the project' : cmd} on ${val(MERGE_MORE[2]) === 'branch_only' ? 'the branch on its own' : 'the result after merging'}; a failure stops the merge` : 'Off: work can be merged without tests'],
        ['A full run or a release', `Uses ${name(t.triggers.manual)}`],
        ['Flaky tests', 'A test that passes on a later try is marked flaky and reported']]) }); }, count: 0 },
      { key: 'tech', html: () => ui.card({ title: 'Ready-made browser checks', help: 'Click-through checks the built-in browser can run on Puppet Master itself.', body: ui.facts(WORKFLOWS.map(([a, b]) => [a, `Ready · ${b}`])) })
        + ui.card({ title: 'Technical details', body: ui.facts([['Quick start-up test', 'pm test --native --smoke'], ['Desktop size', '1440 × 1000'], ['Narrow size', '900 × 900'], ['Phone size', '390 × 844']]) + btnRow(ui.btn({ label: 'Check the testing setup', icon: 'test', action: 'pm51-testing-diagnostics' })) }), count: 0 }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'How testing works', action: 'pm51-testing-help' }, { label: 'How long and how far one run may go', go: 'safety/limits' }, { label: 'What it must ask you before doing', go: 'safety/asking' }, { label: 'Put testing back to how it came…', action: 'pm51-testing-reset' }]) }],
    changes: [
      { was: 'Testing & Debug is five tabs (Profiles, When to test, What it can test, Debug, History). The one choice that decides whether anything is tested at all, “Let the assistant test its work”, is the first row of the second tab.', now: 'It is the first question on the page, as three answers that each say what happens. “How hard may it try” (tries after a failure, and what then) reads as one sentence under it.' },
      { was: 'A test profile is a row in a list beside a detail pane. Edit, Duplicate, Make default and Delete exist only in its “More actions” menu.', now: 'A test profile has a page of its own, and the four are ordinary buttons on it. Each runs the menu’s own item, so the Edit panel and the Delete question are PMConcept7’s.' },
      { was: 'A test profile says when it runs twice: its own “When it runs” (set in Edit) and the three “When tests run” choices on the next tab. Edit changes the first and leaves the second: after setting Thorough verification to “After meaningful edits”, its detail says so while “When to test” still runs it “Before completion” (seen in PMConcept7, run 10). The second is the one that is used.', now: 'One list, “When tests run”. A profile’s row and page read it (“Runs before a job is called done”), so there is no second copy to drift.' },
      { was: 'Two checks stand on one tab with nothing telling them apart: “Before completion” (a test profile) and “Before merging” (a switch and three rows) (X1 R-38).', now: 'They are two of four moments in one list, each with a line saying what it holds back. The three detail rows of the merge check are under More options.' },
      { was: '“What it can test” is 22 rows, 4 of them folded. 17 are the same choice of Automatic, Always or Never, and two are not settings but links to Browser & SCM (“Screenshots”, “Browser status”).', now: 'Four lines say what is switched on, in words (“4 automatic · 1 never”). The rows are under More options, in the same three groups; the browser’s own choices are named once, with a link.' },
      { was: 'The History tab is 3,067 px tall: three runs, then six cards in the Plans’ own words (“Immutable raw evidence”, “Inspect Provenance”, “Display-only masking”), then six keep-for rows.', now: 'The three latest runs are here. Every run and every recording is on “Past test runs”, each recording with a page in plain words; the keep-for rows are on Backups & history › How long things are kept.' },
      { was: '“Reset testing defaults” and “How testing works” repeat under all five tabs.', now: 'Each appears once, at the foot of this page.' }
    ]
  });
  if (testing) testing.covers = { [POLICY]: 'The three answers under “May the assistant test its own work?”.', [PM]: 'The third line of “When tests run”.', [SESSION]: 'The task “Watch a test that is running”.' };

  /* ================================================================== one test profile */
  const KIND = { web: 'A web app in a browser', desktop: 'A desktop app', api: 'An API or background service', unit: 'Unit tests' };
  const PASS = { all: 'Every check passes', new: 'Nothing new fails' };
  const WHERE = { local: 'On this computer', container: 'In a clean container', server: 'On your Server' };
  const RESULTS = { history: 'Past test runs', report: 'Past test runs, and a report file in the project', chat: 'Past test runs, and a few lines in the chat' };
  const TIMEOUTS = ['10 minutes', '20 minutes', '45 minutes', '2 hours'];
  const RETRY_LABELS = [['0', 'Do not try again'], ['1', 'Once'], ['2', 'Twice'], ['3', '3 times']];
  const profOf = (ctx) => profiles(ctx.st).find((p) => p.id === (ctx.params || {}).id) || null;
  itemAct('cw-profile-item', 'profiles', profiles, 'code/testing');
  SMX.page({
    id: 'code/testing/:id', chapter: 'code', parent: 'code/testing',
    title: (ctx) => { const p = profOf(ctx); return p ? p.name : 'Test profile'; },
    nav: (ctx) => { const p = profOf(ctx); return p ? p.name : 'Test profile'; },
    purpose: (ctx) => (profOf(ctx) ? 'A test profile: a list of stages, which are checks that run one after another. A failing stage stops the run.' : ''),
    legacy: [['code', 'testing', 'profiles', 'testing']],
    headSide: (ctx) => { const p = profOf(ctx); return p ? ui.btn({ label: 'Run now', icon: 'play', primary: true, small: false, action: 'pm51-testing-run', data: { id: p.id } }) : ''; },
    lead: (ctx) => {
      const st = ctx.st, p = profOf(ctx);
      if (!p) return gone('This test profile', 'code/testing', 'Back to Testing');
      const lr = lastRun(st, p.name), ms = momentsOf(st, p.name), stages = p.stages || [];
      const item = (label, name, o) => ui.btn(Object.assign({ label, do: 'cw-profile-item', data: { id: p.id, item: name, title: p.name } }, o || {}));
      const facts = [
        { label: 'What it checks', value: p.description || 'Not said' },
        p.kind ? { label: 'What it tests', value: KIND[p.kind] || p.kind } : null,
        p.kind ? { label: p.kind === 'unit' ? 'What runs' : 'How it starts', value: p.kind === 'unit' ? (p.commands || []).join(', ') || 'Not set' : p.command || 'Not set' } : null,
        p.url ? { label: 'Address', value: p.url } : null,
        p.kind ? { label: 'What counts as a pass', value: PASS[p.pass] || PASS.all } : null,
        p.browser && p.browser !== 'None' ? { label: 'In a browser', value: p.browser } : null,
        p.native && p.native !== 'None' ? { label: 'The app itself', value: p.native } : null,
        p.kind === 'api' || p.kind === 'unit' ? { label: 'Where it runs', value: WHERE[p.where] || WHERE.local } : null,
        p.kind ? { label: 'Where its results go', value: RESULTS[p.results] || RESULTS.history } : { label: 'Proof it keeps', value: p.evidence || 'Failures and a summary' }
      ];
      return [
        { key: 'summary', html: ui.summary({ icon: 'flask', tone: lr ? (passed(lr) ? 'ready' : 'attention') : 'info', lines: [
          `${ui.b(p.name)} runs ${ui.word(ms.length ? ms.map((m) => m.runs).join(' and ') : 'only when you start it', { go: 'code/testing', anchor: 'when' })}.${isDefault(p) ? ' It is the default: new work uses it when nothing else is chosen.' : ''}`,
          lr ? `Its last run, ${h(whenOf(lr))}, ${passed(lr) ? 'passed' : `ended with ${h(String(lr.result).toLowerCase())}`} after ${h(lr.duration)}.` : 'It has not run yet.'
        ], side: lr ? ui.btn({ label: 'See that run', icon: 'history', action: 'pm51-testing-open-run', data: { index: lr.index } }) : '' }) },
        { key: 'facts', html: ui.card({ title: 'What it does', body: ui.rows(facts) }) },
        { key: 'stages', html: ui.card({ title: 'Its stages', help: 'They run in this order.', body: stages.length ? stepList(stages.map((s, i) => ({ title: s, desc: i === 0 ? 'Runs first' : 'Runs after the stage before it' }))) : ui.note('No stages yet. Edit the profile to add some.', 'info') }) },
        { key: 'tries', html: ui.card({ title: 'How hard it tries', body: ui.rows([
          { label: 'Stop the run after', help: 'A run that takes longer is stopped and counts as failed.', control: select(p.timeout || '20 minutes', TIMEOUTS.includes(p.timeout || '20 minutes') ? TIMEOUTS : [p.timeout].concat(TIMEOUTS), { action: 'pm51-testing-profile-field', data: { id: p.id, field: 'timeout' }, label: 'Time limit' }) },
          { label: 'Try a failing stage again', help: 'Only for this profile. The Testing page has the choice for all the others.', control: select(String(p.retries == null ? 1 : p.retries), RETRY_LABELS, { action: 'pm51-testing-profile-field', data: { id: p.id, field: 'retries' }, label: 'Retries' }) }
        ]) }) },
        { key: 'actions', html: btnRow(
          item('Edit…', 'Edit', { icon: 'edit' }), item('Duplicate', 'Duplicate', { icon: 'copy' }),
          item('Make it the default', 'Make default', { icon: 'pin', disabled: isDefault(p), reason: 'It is already the default.' }),
          item('Delete…', 'Delete', { icon: 'trash', danger: true, disabled: isDefault(p), reason: 'The default test profile cannot be deleted. Make another one the default first.' })) }
      ];
    },
    expert: [{ key: 'plan', when: (ctx) => !!profOf(ctx), html: (ctx) => { const p = profOf(ctx); if (!p) return ''; return ui.card({ title: 'The whole plan', body: ui.facts([['Stages, in order', (p.stages || []).join(' → ') || 'None'], ['Used', isDefault(p) ? 'By default, for new work' : 'When it is chosen'], ['Its id', p.id]]) + btnRow(ui.btn({ label: 'Check the testing setup', icon: 'test', action: 'pm51-testing-diagnostics' })) }); }, count: 0 }],
    changes: [
      { was: 'A test profile’s details share a pane with the list of profiles: four facts, its stages, a folded “More options” (time limit, retries, “Effective plan”) and a “Running sessions” row that belongs to no profile.', now: 'One page per test profile: what it does, its stages, when it runs, how hard it tries, then its actions. “Watch a test that is running” is on the Testing page, where it belongs.' },
      { was: 'Edit, Duplicate, Make default and Delete are inside “More actions”. For the default profile, Make default and Delete are greyed with two words of reason (“Already default”, “Default profile”).', now: 'Four buttons. A button that cannot be used says why and what to do first.' },
      { was: 'The detail says “When it runs: Before completion” from the profile’s own field, which Edit can set to something the “When tests run” choices do not agree with.', now: '“When it runs” lists the moments that really use this profile, and one button leads to where that is chosen.' }
    ]
  });

  /* ================================================================== past runs, and the recordings kept from them */
  const EV = () => (typeof W.PM7_TEST_CAPTURE_EVIDENCE === 'object' && W.PM7_TEST_CAPTURE_EVIDENCE) || null;
  const recordings = () => { const e = EV(); return e && Array.isArray(e.fixtures) ? e.fixtures : []; };
  const REC_KIND = { raw: ['Recording', 'A screen recording of a test run. It is kept exactly as it was recorded: never overwritten, trimmed or edited.'], absence: ['Nothing recorded', 'A test run that ended with nothing recorded. That is written down on purpose, so a later recording can never pass for this one.'], derived: ['Demonstration video', 'A video cut from a recording of a test run. The recording it came from stays untouched.'] };
  const REC_STATE = { complete: ['Complete', 'ready', 'The whole run was recorded.'], partial_with_gaps: ['Has gaps', 'attention', 'Part of the run is missing. The gaps are marked and are never filled in afterwards.'], redacted: ['Private details hidden', 'ready', 'Private details were hidden before it was saved.'], no_recording: ['Nothing kept', 'off', 'Nothing was kept from this run.'], manifest_verified: ['Checked', 'ready', 'Its list of cuts and edits was checked against the recording.'], source_missing: ['Its recording is missing', 'attention', 'The recording it was cut from is gone, so this video cannot be checked against it.'] };
  const recKind = (fx) => REC_KIND[fx.kind] || REC_KIND.raw;
  const recState = (fx) => REC_STATE[fx.state] || [fx.stateLabel || '', 'info', ''];
  const recOf = (ctx) => recordings().find((x) => x.id === (ctx.params || {}).id) || null;
  const RUNS_CRUMBS = [['code', 'Code & tools'], ['code/testing', 'Testing']];
  SMX.page({
    id: 'code/test-runs', chapter: 'code', parent: 'code/testing', icon: 'history',
    title: 'Past test runs',
    purpose: 'What each test run found, and the screen recordings kept from test runs as proof.',
    legacy: [['code', 'testing', 'history', 'testing']],
    keywords: ['test history', 'test results', 'recording', 'capture', 'evidence', 'proof', 'demonstration video', 'export evidence'],
    crumbs: () => RUNS_CRUMBS,
    lead: (ctx) => {
      const st = ctx.st, runs = T(st).runs, recs = recordings(), last = runs[0];
      const n = (k) => recs.filter((x) => x.kind === k).length;
      return [
        { key: 'summary', html: ui.summary({ icon: 'history', tone: last ? (passed(last) ? 'ready' : 'attention') : 'info', lines: [
          last ? `${ui.b(count(runs.length, 'run'))} ${runs.length === 1 ? 'is' : 'are'} on record. The latest, ${h(last.profile)} ${h(whenOf(last))}, ${passed(last) ? 'passed' : `ended with ${h(String(last.result).toLowerCase())}`}.` : 'No test has run yet.',
          recs.length ? `Kept from test runs: ${[n('raw') ? count(n('raw'), 'recording') : '', n('derived') ? count(n('derived'), 'demonstration video') : '', n('absence') ? `${count(n('absence'), 'run')} that ended with nothing recorded` : ''].filter(Boolean).join(', ')}.` : ''
        ] }) },
        { key: 'runs', html: ui.things({ title: 'Runs', help: 'Open a run to see each stage and what was kept as proof.', items: runs.map((r, i) => runItemRow(st, r, i)), empty: { icon: 'history', title: 'No runs yet', text: 'A run shows up here once a test has run.' } }) },
        { key: 'recordings', html: recs.length ? ui.things({ title: 'Recordings kept as proof', help: 'A recording is kept exactly as it was made. A demonstration video is cut from one and never replaces it.',
          items: recs.map((fx) => { const s = recState(fx); return { icon: fx.kind === 'derived' ? 'play' : fx.kind === 'absence' ? 'info' : 'image', name: fx.title, tag: recKind(fx)[0], sub: s[2], status: { text: s[0], tone: s[1] }, go: `code/test-runs/${enc(fx.id)}` }; }) })
          + ui.note('These are examples: nothing is recorded, played or downloaded in this preview.', 'info') : '' },
        { key: 'kept', html: ui.card({ title: 'What is kept from a run', body: ui.rows([
          { label: 'A run that passes', value: 'A summary only' },
          { label: 'A run that fails', value: 'Everything it printed' },
          { label: 'Pictures of the page', value: (SHOTS.find((x) => x[0] === T(st).shots) || [0, T(st).shots])[1], control: ui.btn({ label: 'Change', go: 'code/browser', anchor: 'may' }) },
          { label: 'Secrets and personal data', value: val('planning.verification.evidence-redaction') ? 'Hidden before anything is saved' : 'Kept as they are', control: ui.btn(Object.assign({ label: 'Change' }, SMX.at('planning.verification.evidence-redaction'))) },
          { label: 'Kept for', value: txt(RETAIN) || 'Until I delete them', control: ui.btn({ label: 'Change', go: 'keeping/cleanup', reveal: RETAIN }) }
        ]) + btnRow(ui.btn({ label: 'Save the proof to a folder…', icon: 'download', action: 'pm51-testing-export' }), ui.btn({ label: 'Clear the list of runs…', icon: 'trash', danger: true, action: 'pm51-testing-clear-history', disabled: !runs.length, reason: 'There are no runs to clear.' })) }) }
      ];
    },
    changes: [
      { was: 'History is the fifth tab of Testing & Debug. Its six evidence cards are headed “Raw Test Capture”, “Absence record” and “Demonstration Video”, with facts such as “Immutable raw evidence”, “Display-only masking is never presented as source or encoder redaction” and buttons “Inspect Provenance” and “View Source Capture” (A7 N-5).', now: 'A list of recordings in plain words: what it is, whether it is complete, and one line on why. Each opens a page; the Plans’ own words are kept there under “For experts”.' },
      { was: '“Export evidence” and “Clear history” are folded under “More options” beside five read-only “Policy” lines; “Screenshots” and “Test run logs kept” there restate settings from two other pages with no link.', now: '“What is kept from a run” says the same five facts, and each one that can be changed has a button to the page where it is changed. Saving and clearing are two buttons under it.' }
    ]
  });
  SMX.page({
    id: 'code/test-runs/:id', chapter: 'code', parent: 'code/test-runs',
    title: (ctx) => { const fx = recOf(ctx); return fx ? fx.title : 'Recording'; },
    nav: (ctx) => { const fx = recOf(ctx); return fx ? fx.title : 'Recording'; },
    purpose: (ctx) => { const fx = recOf(ctx); return fx ? recKind(fx)[1] : ''; },
    crumbs: () => RUNS_CRUMBS.concat([['code/test-runs', 'Past test runs']]),
    legacy: [['code', 'testing', 'history', 'testing']],
    lead: (ctx) => {
      const fx = recOf(ctx);
      if (!fx) return gone('This recording', 'code/test-runs', 'Back to past test runs');
      const s = recState(fx), src = fx.source ? recordings().find((x) => x.id === fx.source) : null;
      const prov = (o) => ui.btn(Object.assign({ label: 'See where it came from', icon: 'search', action: 'capture-inspect-provenance', data: { uiActionId: 'ui.capture.artifacts.inspect_provenance', ownerCommandId: 'cmd.artifacts.inspect_capture_provenance', targetId: fx.id, artifactId: fx.id } }, o || {}));
      const buttons = fx.kind === 'raw' ? [prov(), ui.btn({ label: 'Make a demonstration video', icon: 'play', disabled: true, reason: 'Not available in this preview. In the app it cuts a video from this recording and leaves the recording untouched.' })]
        : fx.kind === 'absence' ? [prov({ disabled: true, reason: 'Nothing was recorded, so there is no record to open.' })]
        : [ui.btn({ label: 'Open the recording it was cut from', icon: 'image', action: 'capture-view-source', data: { uiActionId: 'ui.capture.artifacts.view_source', targetId: fx.id, artifactId: fx.id, sourceId: fx.source || '' }, disabled: fx.sourceState !== 'recorded', reason: 'The recording it was cut from is missing. Nothing is put in its place.' }), prov()];
      return [
        { key: 'summary', html: ui.summary({ icon: fx.kind === 'derived' ? 'play' : fx.kind === 'absence' ? 'info' : 'image', tone: s[1], lines: [`${ui.b(fx.title)}: ${h(lower(s[0]))}. ${h(s[2])}`, src ? `Cut from ${ui.word(src.title, { go: `code/test-runs/${enc(src.id)}` })}.` : ''] }) },
        { key: 'actions', html: btnRow(...buttons) },
        { key: 'note', html: ui.note('An example: nothing is recorded, played or downloaded in this preview.', 'info') }
      ];
    },
    expert: [{ key: 'record', when: (ctx) => !!recOf(ctx), html: (ctx) => { const fx = recOf(ctx); if (!fx) return ''; const e = EV(); let cls = ''; try { cls = e.classOf(fx); } catch (err) { cls = ''; } return ui.card({ title: 'The record, in the Plans’ words', body: ui.facts([['Kind', cls], ['State', fx.stateLabel || fx.state], ...((fx.rows || []).map((r) => [r[0], r[1]])), ['Where it was made', fx.sourceLine || ''], ['Relation', fx.relation || '']]) }); }, count: 0 }],
    changes: [
      { was: 'Each recording is a card about 400 px tall on the History tab, written for the people who specify the product: “It is never overwritten, trimmed in place, or converted into a demonstration identity.”', now: 'One sentence says what it is and one says its state. The two things you can do with it are buttons; the full record is one fold away.' }
    ]
  });

  /* ================================================================== Debugging */
  const GRANT_WORDS = { evidence_reads: 'read logs and traces', low_risk_investigation: 'look around safely', temporary_instrumentation: 'add temporary logging' };
  const andList = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  const debugLine = (x) => `Starts ${x.program || 'nothing yet'} with ${x.adapter || 'no debugger yet'}`;
  const folderText = (cwd) => (cwd === '${programFolder}' ? 'The program’s own folder' : !cwd || cwd === '${projectRoot}' ? 'The project folder' : cwd);
  const debugIcon = (x) => (/browser|devtools/i.test(String(x.adapter)) ? 'browser' : /test/i.test(String(x.program) + String(x.adapter)) ? 'flask' : 'play');
  const debugOk = (x) => !x.status || /^(ready|default|ok)$/i.test(String(x.status));
  const debugPage = SMX.extend('code/debug', {
    purpose: 'When something does not work, a debugger runs your program so that it can be stopped at any line and looked inside. A debug profile remembers which program to start and how.',
    keywords: ['debug', 'debugger', 'debug profile', 'breakpoint', 'why does it fail', 'bug'],
    blurb: (ctx) => { const n = debugs(ctx.st).length; return n ? `${count(n, 'debug profile')}, each one press away from starting` : 'No debug profile yet'; },
    status: (ctx) => { const list = debugs(ctx.st); return !list.length ? { text: 'Not set up', tone: 'off' } : list.every(debugOk) ? { text: 'Ready', tone: 'ready' } : { text: 'Needs you', tone: 'attention' }; },
    lead: (ctx) => {
      const st = ctx.st, list = debugs(st);
      const grants = (Array.isArray(val(GRANT)) ? val(GRANT) : []).map((g) => GRANT_WORDS[g]).filter(Boolean);
      return [
        { key: 'summary', html: ui.summary({ icon: 'test', tone: list.length ? 'ready' : 'info', lines: [
          list.length ? `${ui.b(count(list.length, 'debug profile'))} ${list.length === 1 ? 'is' : 'are'} set up. Start one and your program runs with a debugger attached.` : 'No debug profile is set up yet. You only need one when you want to look inside a running program.',
          grants.length ? `While it looks for the cause of a bug, the assistant may ${ui.word(andList(grants), { go: 'code/debug', reveal: GRANT })} without asking each time. Anything riskier it asks for, one step at a time.` : `While it looks for the cause of a bug, the assistant ${ui.word('asks before every step', { go: 'code/debug', reveal: GRANT })}.`
        ] }) },
        { key: 'needs', html: ui.needs(list.filter((x) => !debugOk(x)).map((x) => ({ title: `${x.name} cannot start`, detail: 'Its program or its debugger was not found.', fix: { label: 'Check it', action: 'pm51-testing-check-launch', data: { id: x.id } } }))) },
        { key: 'profiles', html: ui.things({ title: 'Your debug profiles', help: 'Each one starts a program in a way that lets it be stopped and looked inside.', add: { label: 'New debug profile', action: 'pm51-testing-add-debug' },
          items: list.map((x) => ({ icon: debugIcon(x), name: x.name, sub: debugLine(x), sub2: [x.env || 'Project environment', x.args ? `with ${x.args}` : ''].filter(Boolean).join(' · '), status: debugOk(x) ? { text: 'Ready', tone: 'ready' } : { text: 'Cannot start', tone: 'blocked' }, go: `code/debug/${enc(x.id)}`, side: ui.btn({ label: 'Start debugging', icon: 'play', action: 'pm51-testing-start-debug', data: { id: x.id } }) })),
          empty: { icon: 'test', title: 'No debug profiles yet', text: 'Pick what you want to debug; the program and the debugger are found for you.', fix: { label: 'New debug profile', action: 'pm51-testing-add-debug' } } }) }
      ];
    },
    sections: [{ key: 'may', title: 'What the assistant may do while it looks for a bug', help: 'Risky changes are still asked for one by one.', ids: [GRANT, 'safety.approvals.debug-profile-disclosure', 'general.startup.refresh-investigation'] }],
    expert: [{ key: 'limits', title: 'How far a search for the cause may go', help: 'How wide it looks at once, and when it stops.', ids: ['safety.approvals.debug-max-browser-branches', 'safety.approvals.debug-max-no-evidence-loops'] }],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Check that the tests pass first', go: 'code/testing' }, { label: 'What it must ask you before doing', go: 'safety/asking' }, { label: 'Whether it may open the browser’s developer tools', go: 'code/browser', reveal: DEVTOOLS }]) }],
    changes: [
      { was: 'Debug is the fourth tab of Testing & Debug: a list of three debug profiles beside the detail of one, with what debugging may do on its own stacked under that detail as if it belonged to the selected profile.', now: 'Its own page. Two sentences say what a debugger is for and what the assistant may do on its own; then the debug profiles, each with “Start debugging” on its row; then the three choices that hold for all of them.' },
      { was: 'Edit, Duplicate and Delete of a debug profile exist only in its “More actions” menu; arguments, working folder and extra values are folded under “More options”.', now: 'A debug profile has a page: what it starts and how, in six plain rows, with Edit, Duplicate and Delete as buttons.' },
      { was: 'The permission rows are worded for specialists: “Inspect whether the debug automation profile is active, degraded, or blocked, including which powers it has and when they expire.”', now: 'The same three rows, reworded: “What it is allowed right now: shows whether these permissions are in force, which ones, and when they run out.”' }
    ]
  });
  if (debugPage) debugPage.covers = { [DEBUG_LIST]: 'The list “Your debug profiles” on this page.' };

  const debugOf = (ctx) => debugs(ctx.st).find((x) => x.id === (ctx.params || {}).id) || null;
  itemAct('cw-debug-item', 'debug', debugs, 'code/debug');
  SMX.page({
    id: 'code/debug/:id', chapter: 'code', parent: 'code/debug',
    title: (ctx) => { const x = debugOf(ctx); return x ? x.name : 'Debug profile'; },
    nav: (ctx) => { const x = debugOf(ctx); return x ? x.name : 'Debug profile'; },
    purpose: (ctx) => (debugOf(ctx) ? 'A debug profile: which program to start, and with which debugger, so that it can be stopped and looked inside.' : ''),
    legacy: [['code', 'testing', 'debug', 'testing']],
    headSide: (ctx) => { const x = debugOf(ctx); return x ? ui.btn({ label: 'Start debugging', icon: 'play', primary: true, small: false, action: 'pm51-testing-start-debug', data: { id: x.id } }) : ''; },
    lead: (ctx) => {
      const x = debugOf(ctx);
      if (!x) return gone('This debug profile', 'code/debug', 'Back to Debugging');
      const item = (label, name, o) => ui.btn(Object.assign({ label, do: 'cw-debug-item', data: { id: x.id, item: name, title: x.name } }, o || {}));
      const vars = (x.envVars || []).map((v) => String(v).split('=')[0]);
      return [
        { key: 'summary', html: ui.summary({ icon: debugIcon(x), tone: debugOk(x) ? 'ready' : 'blocked', lines: [`${ui.b(x.name)} ${lower(debugLine(x))}.`, debugOk(x) ? 'It is ready to start.' : 'It cannot start: its program or its debugger was not found.'], side: ui.btn({ label: 'Check that it can start', icon: 'test', action: 'pm51-testing-check-launch', data: { id: x.id } }) }) },
        { key: 'facts', html: ui.card({ title: 'What it starts, and how', body: ui.rows([
          { label: 'Program', help: 'What gets started.', value: x.program || 'Not set' },
          { label: 'Debugger', help: 'The tool that stops the program and shows what is inside.', value: x.adapter || 'Not set' },
          { label: 'Words added after the program’s name', value: x.args || 'None', muted: !x.args },
          { label: 'Folder it starts in', value: folderText(x.cwd) },
          { label: 'Set of settings it starts with', value: x.env || 'Project environment' },
          { label: 'Extra values', help: 'Only their names are shown.', value: vars.length ? vars.join(', ') : 'None', muted: !vars.length }
        ]) }) },
        { key: 'actions', html: btnRow(item('Edit…', 'Edit', { icon: 'edit' }), item('Duplicate', 'Duplicate', { icon: 'copy' }), item('Delete…', 'Delete', { icon: 'trash', danger: true })) }
      ];
    },
    changes: [
      { was: 'A debug profile’s detail shows three rows (Debugger, Program, Environment); its arguments, working folder and extra values are under “More options”, and Edit, Duplicate and Delete are inside “More actions”.', now: 'All six facts are on its page in everyday words (“Folder it starts in”, “Words added after the program’s name”), with the three actions as buttons.' }
    ]
  });

  /* ================================================================== Built-in browser */
  const SHOTS = [['On failure', 'When something fails'], ['Always', 'Always'], ['Never', 'Never']];
  const BRW = (st) => Object.assign({ state: 'Ready', share: 'Ask' }, (st.pm51 || {}).browser || {});
  const hostName = (st) => ((d.sp(st).servers || []).find((s) => s.default) || {}).name || (d.homeServer(st) || {}).name || 'your Server';
  const keepsProfile = () => String(val(PROFILE)) === 'persistent';
  const staysSignedIn = () => keepsProfile() && val(SAVE) !== false;
  /* PMConcept7's own handler for this choice fails until the Testing manager has been drawn once (the place it
     writes to does not exist yet), so the choice is written here, to the same place Testing reads. */
  SMX.act('cw-shots', (el) => { const sel = el.querySelector('select'); if (!sel) return; const st = eng().getState(); st.pm51 = st.pm51 || {}; const t = (st.pm51.testing = st.pm51.testing || {}); t.browser = Object.assign({}, t.browser, { screenshots: sel.value }); eng().setState(st); SMX.toast('Saved', `Pictures of a page: ${lower((SHOTS.find((x) => x[0] === sel.value) || [0, sel.value])[1])}.`); });
  /* websites the browser stays signed in to: PMConcept7 has the two settings but no list, so the list is this
     concept's own example and lives only in this page's own state */
  const SITES0 = [
    { id: 'your-app', name: 'localhost:5173', what: 'Your app, while you build it', as: 'demo@tastebook.test', since: '3 days ago', used: 'Thorough verification, yesterday' },
    { id: 'github', name: 'github.com', what: 'GitHub, for pages only signed-in people see', as: 'sittingmongoose', since: 'last week', used: 'A chat, 2 days ago' }
  ];
  const sites = () => { const f = SMX.local.flags; if (!f.cwSites) f.cwSites = SITES0.map((x) => Object.assign({}, x)); return f.cwSites; };
  SMX.act('cw-site-forget', (el) => { const id = el.getAttribute('data-id'), s = sites().find((x) => x.id === id); if (!s) return; kit().confirm(`Sign out of ${s.name}?`, 'The built-in browser forgets this sign-in. Your account on the website itself is not touched.', 'Sign out', () => { SMX.local.flags.cwSites = sites().filter((x) => x.id !== id); SMX.toast('Signed out', `${s.name} is forgotten.`); if (SMX.route !== 'code/browser') SMX.go('code/browser', { replace: true }); else SMX.soon(20); }, true); });
  const mayGroups = (st) => {
    const b = BRW(st), may = [], asks = [], never = [];
    const click = String(val(cap('built-in-browser')));
    (testOff() || click === 'Off' ? never : may).push({ label: 'Open your pages and click through them', help: 'While it tests your work. Chosen with the other kinds of test.', value: testOff() ? 'Testing is off' : txt(cap('built-in-browser')), control: ui.btn({ label: 'Testing', go: 'code/testing', reveal: cap('built-in-browser') }) });
    may.push({ label: 'Read what is on a page', help: 'Its text, and the errors the page reports. It needs this to know what it is looking at.' });
    const shot = T(st).shots;
    (shot === 'Never' ? never : may).push({ label: 'Take pictures of a page', help: 'Kept with the run or the chat that took them, as proof of what it saw.', control: `<span data-smx-do-change="cw-shots">${select(shot, SHOTS, { action: 'pm51-noop', label: 'Take pictures of a page' })}</span>` });
    (staysSignedIn() ? may : never).push(keepsProfile()
      ? { label: 'Use the websites you are signed in to', help: staysSignedIn() ? 'It can use a website as you, without ever seeing your password. The sign-ins it keeps are listed below.' : 'Off: the browser is signed out of everything each time it opens.', covers: SAVE, control: ui.toggle(SAVE, { label: 'Stay signed in to websites' }) }
      : { label: 'Use the websites you are signed in to', help: 'The browser starts clean every time, so no sign-in is kept.', covers: SAVE, control: ui.btn({ label: 'Change', go: 'code/browser', reveal: PROFILE }) });
    const dev = String(val(DEVTOOLS));
    (dev === 'On' ? may : dev === 'Off' ? never : asks).push({ label: 'Open the developer tools', help: 'The browser’s own tools for looking inside a page. Useful when it looks for the cause of a bug.', covers: DEVTOOLS, control: ui.select(DEVTOOLS, { label: 'Open the developer tools' }) });
    (b.share === 'Never' ? never : asks).push({ label: 'Show a picture to a helper', help: 'A helper is an extra worker the assistant starts for part of a job. “Ask” means you approve each time.', control: seg(b.share, ['Ask', 'Never'], { action: 'pm51-browser-share', label: 'Show a picture to a helper' }) });
    const point = val(POINT) !== false;
    (point ? asks : never).push({ label: 'Send the chat what you point at', help: point ? 'You pick something on a page, and nothing is sent until you confirm.' : 'Off: you cannot point at things on a page to share them.', covers: POINT, control: ui.toggle(POINT, { label: 'Let me point at things to share with chat' }) });
    never.push({ label: 'Sign in for you, or type a password', help: 'You sign in yourself, in a protected window that keeps nothing. No choice turns this on.' });
    never.push({ label: 'Take pictures of sign-in pages or password fields', help: 'Nor of anything you mark as private. No choice turns this on.' });
    return [['It may', 'ready', 'without asking', may], ['It asks you first', 'attention', 'each time', asks], ['It never does', 'blocked', '', never]];
  };
  const browserPage = SMX.extend('code/browser', {
    purpose: 'Puppet Master has a browser of its own. The assistant opens it to look at your pages, click through them and take pictures as proof of what it saw.',
    keywords: ['browser', 'screenshot', 'pictures', 'devtools', 'developer tools', 'cookies', 'login', 'sign-in', 'website', 'capture'],
    blurb: (ctx) => { const st = ctx.st; return `${BRW(st).state === 'Ready' ? 'Ready' : 'Not available'} · takes pictures ${lower((SHOTS.find((x) => x[0] === T(st).shots) || [0, 'never'])[1])} · ${staysSignedIn() ? `stays signed in to ${count(sites().length, 'website')}` : 'keeps no sign-ins'}`; },
    status: (ctx) => (BRW(ctx.st).state === 'Ready' ? { text: 'Ready', tone: 'ready' } : { text: 'Not available', tone: 'blocked' }),
    lead: (ctx) => {
      const st = ctx.st, b = BRW(st), ready = b.state === 'Ready', list = staysSignedIn() ? sites() : [];
      return [
        { key: 'summary', html: ui.summary({ icon: 'browser', tone: ready ? 'ready' : 'blocked', lines: [
          ready ? `The built-in browser is ${ui.b('ready')}. It opens only when it is needed, on ${ui.word(hostName(st), { go: 'computers/work' })}; nothing is running right now.` : `The built-in browser ${ui.b('could not start')} on ${ui.word(hostName(st), { go: 'computers/work' })}.`,
          keepsProfile() ? `It keeps ${ui.word('one profile for this project', { go: 'code/browser', reveal: PROFILE })}${staysSignedIn() ? ` and stays signed in to ${ui.word(count(list.length, 'website'), { go: 'code/browser', anchor: 'sites' })}` : ', and no sign-ins'}.` : `It ${ui.word('starts clean every time', { go: 'code/browser', reveal: PROFILE })}: no history and no sign-ins are kept.`
        ], side: ui.btn({ label: 'Check the browser', icon: 'test', action: 'pm51-browser-check' }) }) },
        { key: 'needs', html: ui.needs(ready ? [] : [{ tone: 'blocked', title: 'The built-in browser cannot start', detail: 'Tests that need to see a page are skipped until it can.', fix: { label: 'Check the browser', action: 'pm51-browser-check' } }]) },
        { key: 'may', html: ui.card({ title: 'What the assistant can see and send', help: 'Every line that has a choice carries it. Change one and the line moves to the group it now belongs to.', anchor: 'may', body:
          `<div class="smx-cw-may">${mayGroups(st).map(([word, tone, hint, rows]) => `<div class="smx-cw-may-group"><h4 class="smx-cw-may-head">${ui.status(word, tone)}${hint ? `<small>${h(hint)}</small>` : ''}</h4>${rows.length ? ui.rows(rows) : `<p class="smx-cw-may-none">Nothing, as things are set now.</p>`}</div>`).join('')}</div>` }) },
        { key: 'sites', html: ui.things({ title: 'Websites it stays signed in to', help: 'A website shows up here after you sign in to it in the built-in browser and choose to stay signed in. Your password is never kept.', anchor: 'sites',
          items: list.map((s) => ({ icon: 'globe', name: s.name, sub: `${s.what} · signed in as ${s.as}`, sub2: `Last used by ${lower(s.used)}`, status: { text: 'Signed in', tone: 'ready' }, go: `code/browser/${enc(s.id)}` })),
          empty: { icon: 'globe', title: keepsProfile() ? (val(SAVE) !== false ? 'Not signed in anywhere' : 'No sign-in is kept') : 'The browser starts clean every time', text: keepsProfile() ? (val(SAVE) !== false ? 'Sign in to a website in the built-in browser and it is listed here.' : '“Use the websites you are signed in to” is off, so the browser is signed out each time it opens.') : 'No history and no sign-ins are kept between uses.' } })
          + newNote('New on this page: the list of websites. PMConcept7 has the two settings (“Browser profile”, “Remember website logins”) but shows no list of what is kept, so these two are the concept’s own examples and are not saved.') }
      ];
    },
    sections: [
      { key: 'profile', title: 'What the browser remembers', help: 'Whether it comes back the way you left it.', ids: [PROFILE] },
      { key: 'yours', title: 'When you use the browser yourself', help: 'The screenshot button, and picking something on a page to show the assistant.', ids: ['planning.testing.browser-capture-full-default', 'planning.testing.browser-component-action', 'planning.testing.browser-component-crop'] }
    ],
    more: [{ key: 'pictures', html: () => ui.card({ title: 'What happens to the pictures', body: ui.rows([
      { label: 'Taken of', value: 'Pages the assistant opened: still pictures and short clips' },
      { label: 'Never taken of', value: 'Sign-in pages, password fields, and anything you mark as private' },
      { label: 'Kept with', value: 'The Goal or the chat that made them' },
      { label: 'Kept for', help: 'Set with the rest of the saved proof.', value: txt(RETAIN) || 'Until I delete them', control: ui.btn({ label: 'Change', go: 'keeping/cleanup', reveal: RETAIN }) },
      { label: 'Hidden before saving', help: 'Secrets and private details, in every picture.', value: txt(REDACT), control: ui.btn({ label: 'Change', go: 'safety/protected', reveal: REDACT }) }
    ]) }), count: 0 }],
    moreLabel: 'About the pictures', moreHelp: 'What is taken, how long it is kept, and what is hidden in it',
    expert: [{ key: 'tech', html: (ctx) => { const st = ctx.st, ready = BRW(st).state === 'Ready'; return ui.card({ title: 'Technical details', body: ui.facts([['Runtime state', ready ? 'Idle' : 'Unavailable'], ['Surface', 'Ordinary browser only; no native runtime'], ['Session', 'Ephemeral; not recorded'], ['Automation', 'Unavailable'], ['Runs on', hostName(st)], ['Slow pages', 'Captured once the page settles'], ['Low-resource mode', 'Stills only']]) + btnRow(ui.btn({ label: 'Check the browser’s setup', icon: 'test', action: 'pm51-browser-diagnostics' })) }); }, count: 0 }],
    tail: (ctx) => { const sc = ctx.st.sourceControl || {}, svc = (sc.forges || []).find((f) => f.status === 'active'), git = (sc.tools || []).find((x) => x.id === 'git'); const how = `${svc ? `${svc.name} connected` : 'no code service connected'} · ${git && git.status === 'ready' ? 'Git ready' : 'Git not installed'}`; return [{ key: 'links', html: ui.links([{ label: 'How the browser is used', action: 'pm51-browser-help' }, { label: `The code it tests comes from Source control (${how})`, go: 'source' }, { label: 'The plan it checks against is made in the Planning Wizard', action: 'pm51-browser-wizard' }, { label: 'Put the browser’s choices back to how they came…', action: 'pm51-browser-reset' }]) }]; },
    changes: [
      { was: 'The browser’s page is called “Browser & SCM” and is filed under Source Control. “SCM” is explained nowhere, and one of its four cards (“Depends on”) is two rows that only point at Source Control and the Planning Wizard (A9 W-4, N-3).', now: 'It is “Built-in browser”, under Code & tools beside Testing and Debugging. The two pointers are two quiet links at the foot.' },
      { was: 'What the assistant may see is spread over three cards and two pages: “Screenshots for evidence”, “Let me point at things…”, “Helpers may see screenshots”, “Remember website logins”, “Let the assistant open DevTools”, and on Testing “Click through web pages”. Nothing says what it can never do except a fold named “Capture policy”.', now: 'One card in three groups: it may, it asks you first, it never does. Each line keeps its real control; the two things it can never do are stated, not folded.' },
      { was: '“Remember website logins: keeps approved cookies for later runs” is a switch. Which websites it is signed in to is shown nowhere, and there is no way to sign it out of one.', now: 'A list of the websites it stays signed in to, each with a page and “Sign out of this website”. The list is new and is marked as the concept’s own example.' },
      { was: 'The same screenshot choice is a control here and a link row on Testing (“Screenshots: When something fails [Change]”); “Kept for” and “Hidden before saving” are link rows to Testing and Permissions (A9 R-7, X1 R-40).', now: 'The choice is made here, once. Testing names it in one line with a link; how long pictures are kept and what is hidden in them are two lines that lead to the page that owns each.' }
    ]
  });
  if (browserPage) browserPage.covers = { [POINT]: 'The line “Send the chat what you point at”, under “What the assistant can see and send”.', [SAVE]: 'The line “Use the websites you are signed in to”, under “What the assistant can see and send”.', [DEVTOOLS]: 'The line “Open the developer tools”, under “What the assistant can see and send”.' };

  const siteOf = (ctx) => sites().find((x) => x.id === (ctx.params || {}).id) || null;
  SMX.page({
    id: 'code/browser/:id', chapter: 'code', parent: 'code/browser',
    title: (ctx) => { const s = siteOf(ctx); return s ? s.name : 'Website'; },
    nav: (ctx) => { const s = siteOf(ctx); return s ? s.name : 'Website'; },
    purpose: (ctx) => (siteOf(ctx) ? 'A website the built-in browser stays signed in to, so that a test can use it as you.' : ''),
    legacy: [['source', 'browser-scm']],
    lead: (ctx) => {
      const s = siteOf(ctx);
      if (!s) return gone('This sign-in', 'code/browser', 'Back to Built-in browser');
      return [
        { key: 'summary', html: ui.summary({ icon: 'globe', tone: staysSignedIn() ? 'ready' : 'off', lines: [`The built-in browser is signed in to ${ui.b(s.name)} as ${ui.b(s.as)}.`, staysSignedIn() ? 'The assistant can use this website as you. It never sees your password.' : 'It is kept, but not used: “Use the websites you are signed in to” is off.'] }) },
        { key: 'facts', html: ui.card({ title: 'About this sign-in', body: ui.rows([
          { label: 'Website', help: s.what, value: s.name },
          { label: 'Signed in as', value: s.as },
          { label: 'Since', help: 'You signed in yourself, in a protected window.', value: s.since },
          { label: 'Last used by', value: s.used },
          { label: 'What is kept', help: `On ${hostName(ctx.st)}, in this project’s browser profile.`, value: 'The sign-in only, never the password' }
        ]) + btnRow(ui.btn({ label: 'Sign out of this website…', icon: 'lock', danger: true, do: 'cw-site-forget', data: { id: s.id } })) + newNote('New: PMConcept7 has no list of website sign-ins, so this page is the concept’s own example and is not saved.') }) }
      ];
    },
    changes: [{ was: 'Nothing in Settings shows a single website the browser is signed in to.', now: 'A page for each: who it is signed in as, since when, what last used it, what is kept, and one button to sign out.' }]
  });

  /* ================================================================== Containers */
  const finding = (st, gid, fid) => { const g = ((((st.pm51 || {}).doctor || {}).groups) || []).find((x) => x.id === gid); return g ? (g.findings || []).find((f) => f.id === fid) || null : null; };
  /* does this computer have a container engine? The checkup knows; with no checkup result, nothing is claimed */
  const engineHere = (st) => { const f = finding(st, 'optional', 'containers'); return f ? /^ready$/i.test(String(f.state)) : null; };
  const canRun = (st, s) => (s.role === 'This computer' ? engineHere(st) : /container/i.test(String(s.deployment) + ' ' + (s.environments || []).join(' ')));   // true, false, or null when not checked
  const DOCTOR_FIX = { gid: 'optional', fid: 'containers' };
  SMX.extend('code/containers', {
    purpose: 'A container is a sealed box that holds a program and everything it needs, so it runs the same way on any computer. Docker is the usual tool for making and running them. Only a project that uses Docker needs this page.',
    keywords: ['docker', 'podman', 'container', 'containers', 'compose', 'kubernetes', 'k8s', 'helm', 'docker manager', 'image', 'cleanup', 'ports'],
    blurb: (ctx) => { const st = ctx.st, here = engineHere(st), home = d.homeServer(st); return here === false ? `Optional · container work runs on ${home ? home.name : 'your Server'}` : `Optional · ${txt(X + 'container-runtime') || 'Docker'} on this computer`; },
    status: (ctx) => { const here = engineHere(ctx.st); return here === false ? { text: 'Not needed', tone: 'off' } : here ? { text: 'Ready', tone: 'ready' } : { text: 'Optional', tone: 'off' }; },
    lead: (ctx) => {
      const st = ctx.st, S = d.sp(st), here = engineHere(st), home = d.homeServer(st), engine = txt(X + 'container-runtime') || 'Docker';
      const other = S.servers.find((s) => s.role !== 'This computer' && canRun(st, s) === true) || home;
      return [
        { key: 'summary', html: ui.summary({ icon: 'box', tone: here === false ? 'info' : 'ready', lines: here === false ? [
          `${ui.b('Nothing here needs you.')} Containers are optional, and Puppet Master works without them.`,
          `This computer has no container engine, so work that needs a container runs on ${ui.word(other ? other.name : 'your Server', { go: 'computers/work' })} instead.`
        ] : [
          here ? `${ui.b(engine)} runs containers on this computer. Nothing here needs you unless your project uses it.` : `${ui.b('Nothing here needs you')} unless your project uses containers. They are optional.`,
          val(X + 'docker-manager-visibility') !== false ? 'The Docker tools stay out of the way until a project has a Dockerfile.' : 'The Docker tools show in every project.'
        ] }) },
        { key: 'hosts', html: ui.things({ title: 'Where containers can run', help: 'Work that needs a container is sent to a computer that can run one.',
          items: S.servers.map((s) => { const ok = canRun(st, s), mine = s.role === 'This computer'; return { icon: mine ? 'laptop' : 'nas', name: s.name, tag: mine ? 'This computer' : s.id === S.homeServer ? 'Your Server' : '', sub: ok ? (mine ? `${engine} is set up here.` : 'Runs containers. Work that needs one is sent here.') : ok === null ? 'Not checked yet. A checkup looks for a container engine.' : mine ? `No container engine. That is fine: container work runs on ${other && other.id !== s.id ? other.name : 'another computer'}.` : 'No container engine.', status: ok ? { text: 'Can run containers', tone: 'ready' } : ok === null ? { text: 'Not checked', tone: 'info' } : { text: 'Not set up', tone: 'off' }, go: `computers/list/${enc(s.id)}`, side: ok === false && mine ? ui.btn({ label: 'Set one up', action: 'pm51-doctor-fix', data: DOCTOR_FIX }) : '' }; }) }) },
        { key: 'tasks', html: ui.tasks([
          { icon: 'box', title: 'See what is running', sub: 'Opens the Docker Manager, the panel on the left: containers, images and logs', action: 'open-docker-manager' },
          { icon: 'play', title: 'Choose which computer does the work', sub: 'Containers run where the work runs', go: 'computers/work' },
          { icon: 'upload', title: 'Share your app with others', sub: 'Send an image to Docker Hub or the Unraid app store', go: 'code/publishing' }
        ], { title: 'What do you want to do?', cols: 3 }) }
      ];
    },
    sections: [
      { key: 'docker', title: 'Docker in Puppet Master', help: 'Which program runs containers, and when its tools show.', ids: [X + 'container-runtime', X + 'docker-manager-visibility'] },
      { key: 'running', title: 'When your app runs in a container', help: 'Getting to its page from your own browser.', ids: [X + 'preferred-browser', X + 'port-forward-auto-open', X + 'port-preference-order'] }
    ],
    more: [
      { key: 'compose', title: 'Several containers at once (Compose)', help: 'A Compose file lists the containers a project needs and starts them together.', ids: [X + 'compose-file', X + 'compose-project-name'] },
      { key: 'watch', title: 'Logs, and containers that changed', help: 'How a live log starts, and the warning when a running container no longer matches its files.', ids: [X + 'stream-follow-default', X + 'drift-sensitivity', X + 'drift-comparison-target', X + 'drift-ignore-rules'] },
      { key: 'cleanup', title: 'Disk cleanup', help: 'Old images and containers take up disk space. Nothing is removed without you seeing it first.', ids: [X + 'cleanup-scan-cadence', X + 'cleanup-aggressiveness', X + 'disk-threshold', X + 'protected-assets', X + 'hide-ephemeral-cleanup-warnings'] },
      { key: 'k8s', title: 'Kubernetes', help: 'Only if this project runs on a Kubernetes cluster: a system that runs containers across several computers.', ids: [X + 'k8s-context', X + 'k8s-namespace', X + 'k8s-cluster-wide', X + 'k8s-auto-refresh', X + 'helm-visibility', X + 'k8s-host-policy'] }
    ],
    moreHelp: 'Compose, logs, disk cleanup and Kubernetes',
    expert: [
      { key: 'find', title: 'Finding Docker, and getting inside a container', ids: [X + 'docker-binary-path', X + 'docker-display-context', X + 'container-shell-command'] },
      { key: 'manager', title: 'What the Docker Manager shows and records', help: 'Extra views, and the record of what was done to containers.', ids: [X + 'show-build-advanced', X + 'follow-latest-publish', X + 'publish-history-chain', X + 'k8s-log-defaults', X + 'receipt-verbosity'], also: [X + 'receipt-retention'] }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'What each computer can run', go: 'computers/work' }, { label: 'What the assistant may do without asking', go: 'safety/asking' }, { label: 'How long records are kept', go: 'keeping/cleanup' }]) }],
    changes: [
      { was: 'Containers is one page of 70 rows in ten sections plus a fold, about 5,500 px tall, with no line saying who needs it. The rows of the Unraid store and the publisher profile carry seven “Needed” marks, so a newcomer reads them as things to do (A6 N-6).', now: 'The first sentence says “Nothing here needs you” when this computer has no container engine, and where container work runs instead. Five rows are on the page; the rest is folded. Publishing, registries and the Unraid store are on “Publishing an app”.' },
      { was: 'Running containers, images and logs are not in Settings: they are in the Docker Manager. “Open Docker Manager” does open it, as a panel 240 px wide to the left of Settings, and says so in a toast (“Docker Manager opened. Container operations remain outside Settings.”). The Settings page itself does not change, which is why the audit took the button for dead (A6 B-8); it is not.', now: 'The same action is the first task, worded as what it is for (“See what is running”), and its second line says where to look: the panel on the left.' },
      { was: '“Open Hosts” opens Server & Project Location on its first tab, “Home & Location”. Nothing there is called “Hosts”.', now: 'The computers that can run containers are listed on this page, each opening its own page, and “Choose which computer does the work” is a task.' },
      { was: '“Projects folder” and “Folder for chats with no project” sit among the build rows, after the Compose rows (A6 W-6).', now: 'They are under Computers & remote access › Where projects are kept.' },
      { was: 'One row is labelled “Open container web pages in”, a fifth meaning of “browser” in Settings (X1 R-39); cleanup has a list named “Never clean these up”.', now: '“Open your app in”, with a line saying this is your own browser and not the built-in one; “Never remove these”.' }
    ]
  });

  /* ================================================================== Publishing an app */
  const FLOWS = (st) => ((st.pm51 || {}).o55Flows) || {};
  const hub = (st) => { const f = FLOWS(st)[HUB_IN] || {}, v = f.values || {}; return { on: !!(v.username && v.token) || !!val(X + 'dockerhub-token'), user: v.username || '', last: f.last || '' }; };
  /* the other registries are kept by PMConcept7's own "Sign in to another registry" panel, which copies its example
     into the saved state the first time it is opened; until then the example is read from where the panel reads it */
  const otherRegs = (st) => { const f = FLOWS(st)[REGS]; if (f && Array.isArray(f.items)) return f.items; try { return ((kit().rowMeta(REGS).flow || {}).items || []).map((x) => Object.assign({}, x)); } catch (e) { return []; } };
  const empty = (id) => { const v = val(id); return v == null || v === '' || (Array.isArray(v) && !v.length); };
  const missingListing = () => [[X + 'app-template-categories', 'its store categories']].filter(([id]) => empty(id)).map((x) => x[1]);
  const missingPublisher = () => [[X + 'maintainer-name', 'your publisher name'], [X + 'maintainer-about', 'a line about you'], [X + 'maintainer-support-url', 'where people get help'], [X + 'maintainer-icon', 'a picture']].filter(([id]) => empty(id)).map((x) => x[1]);
  const repoSet = (st) => !!((FLOWS(st)[REPO_SETUP] || {}).values);
  const unraidMissing = (st) => missingListing().length + missingPublisher().length + (repoSet(st) ? 0 : 1);
  const pushWord = () => (String(val(PUSH)) === 'After Build' ? 'after every build' : 'only when you say so');
  const flowBtn = (id, o) => ui.btn(Object.assign({ action: 'run-setting-action', data: { setting: id } }, o));
  SMX.act('cw-reg-remove', (el) => { const i = Number(el.getAttribute('data-i')), it = otherRegs(SMX.fresh())[i]; if (!it) return; kit().confirm(`Remove ${it.label}?`, 'Its saved token is removed from the keychain.', 'Remove', () => { const st = eng().getState(); st.pm51 = st.pm51 || {}; const all = (st.pm51.o55Flows = st.pm51.o55Flows || {}), f = (all[REGS] = all[REGS] || {}); if (!Array.isArray(f.items)) f.items = otherRegs(st); f.items.splice(i, 1); eng().setState(st); SMX.toast('Removed', it.label); SMX.go('code/publishing', { replace: true }); }, true); });
  const publishing = SMX.extend('code/publishing', {
    purpose: 'For when other people should be able to install what you built. Puppet Master packs the project into an image (a ready-to-run copy), sends it to a registry (an online shelf such as Docker Hub), and can list it in the Unraid app store.',
    keywords: ['publish', 'publishing', 'docker hub', 'registry', 'ghcr', 'image', 'push', 'unraid', 'community apps', 'template', 'release my app', 'share my app'],
    blurb: (ctx) => { const st = ctx.st, k = hub(st); return k.on ? `Images go to ${txt(DEFREG) || 'Docker Hub'}, ${pushWord()}` : 'Nothing is published yet · Docker Hub is not connected'; },
    status: (ctx) => (hub(ctx.st).on ? { text: 'Ready', tone: 'ready' } : { text: 'Not set up', tone: 'off' }),
    lead: (ctx) => {
      const st = ctx.st, k = hub(st), def = txt(DEFREG) || 'Docker Hub', project = d.project(st), n = unraidMissing(st), others = otherRegs(st);
      const defGo = /docker hub/i.test(def) ? 'code/publishing/docker-hub' : 'code/publishing';
      return [
        { key: 'summary', html: ui.summary({ icon: 'upload', tone: k.on ? 'ready' : 'info', lines: k.on ? [
          `Images of ${ui.b(project)} go to ${ui.word(def, { go: defGo, reveal: defGo === 'code/publishing' ? DEFREG : '' })}, ${ui.word(pushWord(), { go: 'code/publishing', reveal: PUSH })}.`,
          `Docker Hub is connected${k.user ? ` as ${h(k.user)}` : ''}.`
        ] : [
          `${ui.b(`Nothing is published from ${project}, and nothing here needs you`)} until you want other people to install your app.`,
          `When you do, images go to ${ui.word(def, { go: defGo, reveal: defGo === 'code/publishing' ? DEFREG : '' })}, and ${ui.word(pushWord(), { go: 'code/publishing', reveal: PUSH })}.`
        ] }) },
        { key: 'places', html: ui.things({ title: 'Where images can go', help: 'A registry is an online shelf for images. People install your app by fetching its image from one.', add: { label: 'Sign in to another registry', action: 'run-setting-action', data: { setting: REGS } },
          items: [{ icon: 'cloud', name: 'Docker Hub', tag: /docker hub/i.test(def) ? 'Images go here' : '', sub: k.on ? `Signed in${k.user ? ` as ${k.user}` : ''}` : 'The usual public registry. Not signed in; needed only once you publish there.', status: k.on ? { text: 'Connected', tone: 'ready' } : { text: 'Not connected', tone: 'off' }, go: 'code/publishing/docker-hub' },
            ...others.map((r, i) => ({ icon: 'cloud', name: r.label, tag: /ghcr/i.test(def) && /ghcr\.io/i.test(r.label) ? 'Images go here' : '', sub: r.help || '', status: { text: /saved/i.test(String(r.value)) ? 'Signed in' : String(r.value || 'Signed in'), tone: 'ready' }, go: `code/publishing/registry/${i}` }))] }) },
        { key: 'stores', html: ui.things({ title: 'App stores', help: 'A store is where people find your app. A listing there points at the image in a registry.',
          items: [{ icon: 'box', name: 'Unraid app store', tag: 'Optional', sub: 'For people who run an Unraid home server. Your app shows up in its Community Apps list.', sub2: n ? `${count(n, 'thing')} would have to be filled in first.` : 'Everything it asks for is filled in.', status: n ? { text: 'Not listed', tone: 'off' } : { text: 'Ready to list', tone: 'ready' }, go: 'code/publishing/unraid' }] }) },
        { key: 'tasks', html: ui.tasks([
          k.on ? null : { icon: 'user', title: 'Connect Docker Hub', sub: 'Your user name and a token; publishing can then use your account', action: 'run-setting-action', data: { setting: HUB_IN } },
          { icon: 'plus', title: 'Create a Docker Hub repository', sub: 'A place on Docker Hub for this project’s images', action: 'run-setting-action', data: { setting: HUB_NEW } }
        ], { title: 'What do you want to do?' }) }
      ];
    },
    sections: [{ key: 'when', title: 'Sending images', help: 'Where a finished image goes, and whether it waits for you.', ids: [PUSH, DEFREG] }],
    more: [{ key: 'build', title: 'How images are made', help: 'How versions are told apart, and which kinds of computer the app can run on.', ids: [X + 'tag-templates', X + 'build-platforms'] }],
    moreLabel: 'More options', moreHelp: 'Version names, and the kinds of computer an image is built for',
    expert: [
      { key: 'files', title: 'Where the build files are', help: 'Only when they are not where Docker expects them. A wrong value here stops every build.', ids: [X + 'dockerfile-path', X + 'build-context', X + 'build-target-stage'] },
      { key: 'company', title: 'Registries at work', help: 'Rules a company sets for its own registries: trust, proxy and certificates.', ids: [X + 'enterprise-registries'] }
    ],
    tail: () => [{ key: 'links', html: ui.links([{ label: 'Containers: running your app on your own computers', go: 'code/containers' }, { label: 'Whether the assistant must ask before it publishes', go: 'safety/asking' }, { label: 'Code services such as GitHub are under Source control', go: 'source' }]) }],
    changes: [
      { was: 'Publishing is 36 of the 70 rows on the Containers page: “Docker Hub and other registries” (10 rows), “Building & publishing images” (10), “Unraid templates” (5), “Your app’s store listing” (5) and “Your publisher profile” (6), all open, in that order, between the Docker engine rows and the running-container rows.', now: 'A page of its own that opens on “Nothing is published… and nothing here needs you”. Two short lists say where images can go and which store can list the app; each entry opens a page. Two rows are on the page itself.' },
      { was: 'Docker Hub is ten rows with no state: nothing says whether you are signed in. “Other registry sign-ins” is a button; the registry already signed in (ghcr.io) is visible only after opening its panel.', now: 'Docker Hub and every other registry are rows with a status (“Not connected”, “Signed in”), and each has a page.' },
      { was: 'One row is labelled “Create a new repository”, the same words Source Control uses for an online copy of your code (X1 R-37).', now: '“Create a Docker Hub repository”, as a task here and a button on Docker Hub’s page.' },
      { was: 'Seven rows of the Unraid store are marked “Needed” on a page every Docker user must scroll through.', now: 'The store is one row marked “Optional”, with a count of what is still missing. Its rows are on its own page.' }
    ]
  });
  if (publishing) publishing.covers = { [REGS]: 'The list “Where images can go” and its button “Sign in to another registry”.' };

  /* ------------------------------------------------------------------ Docker Hub (registered before the page for
     any other registry, so its fixed address is matched first) */
  SMX.page({
    id: 'code/publishing/docker-hub', chapter: 'code', parent: 'code/publishing', icon: 'cloud',
    title: 'Docker Hub',
    purpose: 'The usual public registry: an online shelf that keeps your app’s images so that other people can install them.',
    legacy: [['code', 'code-reference']],
    keywords: ['docker hub', 'dockerhub', 'access token', 'repository', 'namespace'],
    headSide: (ctx) => { const k = hub(ctx.st); return `<span data-smx-covers="${HUB_IN}">${flowBtn(HUB_IN, { label: k.on ? 'Sign in again' : 'Connect Docker Hub', icon: 'user', primary: !k.on, small: false })}</span>`; },
    lead: (ctx) => {
      const st = ctx.st, k = hub(st), project = d.project(st), ns = String(val(X + 'dockerhub-namespace') || ''), repo = String(val(X + 'dockerhub-repository') || '');
      const where = `${ns && !/custom/i.test(ns) ? `under ${h(ns)}` : 'under your own account'}, into a repository ${repo && !/custom/i.test(repo) ? `called ${h(repo)}` : 'named after the project'}`;
      return [
        { key: 'summary', html: ui.summary({ icon: 'cloud', tone: k.on ? 'ready' : 'info', lines: k.on ? [
          `Docker Hub is ${ui.b('connected')}${k.user ? ` as ${ui.b(k.user)}` : ''}. Images of ${h(project)} go ${where}.`,
          k.last ? `Last signed in ${h(k.last)}. Only the token is kept, in your Server’s keychain.` : 'Only the token is kept, in your Server’s keychain.'
        ] : [
          `Docker Hub is ${ui.b('not connected')}. Nothing can be published there until it is, and nothing else depends on it.`,
          'Connecting takes your Docker Hub user name and a token you make on its website. Only the token is kept.'
        ] }) },
        { key: 'tasks', html: `<div data-smx-covers="${HUB_NEW}">${ui.tasks([{ icon: 'plus', title: 'Create a Docker Hub repository', sub: `A place for the images of ${project}: under whom, its name and who may fetch it`, action: 'run-setting-action', data: { setting: HUB_NEW } }], { title: 'Use it', cols: 1 })}</div>` }
      ];
    },
    sections: [
      { key: 'where', title: 'Where your images go on Docker Hub', ids: [X + 'dockerhub-namespace', X + 'dockerhub-repository', X + 'repo-privacy'] },
      { key: 'signin', title: 'Signing in', help: 'How Puppet Master shows Docker Hub who you are.', ids: [X + 'dockerhub-auth-method', X + 'dockerhub-token'] }
    ],
    covers: { [HUB_IN]: 'The button in the heading of this page (“Connect Docker Hub”, then “Sign in again”); also a task on Publishing an app.', [HUB_NEW]: 'The task “Create a Docker Hub repository” on this page; also a task on Publishing an app.' },
    changes: [
      { was: 'Docker Hub’s ten rows sit in one card on the Containers page with no summary, and nothing says whether you are connected. “Connect Docker Hub” is the third row; its help and its panel say “Sign in via browser, test that saved credentials still work, or clear them”, but the panel is a form for a user name and a token, with no test and no clear (seen in PMConcept7, run 10).', now: 'Its own page. One sentence says whether it is connected, as whom and since when, and where images go; the button in the heading connects, and reads “Sign in again” once it is connected. The panel is PMConcept7’s own and is unchanged.' },
      { was: 'The token can be given in two places with nothing joining them: the “Access token” field of “Connect Docker Hub”, and the separate row “Docker Hub access token [Add key]”.', now: 'Both are kept (nothing is dropped), under one heading, “Signing in”, with the connect button above them, and the page counts as connected when either holds a token.' }
    ]
  });
  const regOf = (ctx) => { const i = Number((ctx.params || {}).n); const r = otherRegs(ctx.st)[i]; return r ? { r, i } : null; };
  SMX.page({
    id: 'code/publishing/registry/:n', chapter: 'code', parent: 'code/publishing',
    title: (ctx) => { const o = regOf(ctx); return o ? o.r.label : 'Registry'; },
    nav: (ctx) => { const o = regOf(ctx); return o ? o.r.label : 'Registry'; },
    purpose: (ctx) => (regOf(ctx) ? 'A registry you are signed in to. Images can be sent here instead of Docker Hub.' : ''),
    legacy: [['code', 'code-reference']],
    lead: (ctx) => {
      const o = regOf(ctx);
      if (!o) return gone('This registry', 'code/publishing', 'Back to Publishing an app');
      const r = o.r, def = txt(DEFREG) || '', isDef = /ghcr/i.test(def) && /ghcr\.io/i.test(r.label);
      return [
        { key: 'summary', html: ui.summary({ icon: 'cloud', tone: 'ready', lines: [`You are signed in to ${ui.b(r.label)}${r.help ? ` (${h(r.help)})` : ''}.`, isDef ? 'Images go here unless you name another registry.' : `Images go to ${ui.word(def || 'Docker Hub', { go: 'code/publishing', reveal: DEFREG })} unless you name this one.`] }) },
        { key: 'facts', html: ui.card({ title: 'About this sign-in', body: ui.rows([
          { label: 'Address', value: r.label },
          { label: 'Account', value: r.help || 'Not said' },
          { label: 'Its token', help: 'Kept in your Server’s keychain. It is never shown again.', status: ui.status(/saved/i.test(String(r.value)) ? 'Saved' : String(r.value || 'Saved'), 'ready'), control: flowBtn(REGS, { label: 'Sign in again', icon: 'refresh' }) }
        ]) + btnRow(ui.btn({ label: 'Send images here by default', go: 'code/publishing', reveal: DEFREG }), ui.btn({ label: 'Remove this sign-in…', icon: 'trash', danger: true, do: 'cw-reg-remove', data: { i: o.i } })) }) }
      ];
    },
    changes: [{ was: 'A registry other than Docker Hub exists only as a line inside the panel “Sign in to another registry”, with a trash button.', now: 'It is a row on “Publishing an app” and has this page: its address, who you are there, its token, and removing it.' }]
  });

  /* ------------------------------------------------------------------ the Unraid app store */
  SMX.page({
    id: 'code/publishing/unraid', chapter: 'code', parent: 'code/publishing', icon: 'box',
    title: 'Unraid app store',
    purpose: 'Unraid is a system people run on a home server, and its Community Apps list is where they find apps to install. This page gets your app listed there. If that is not for you, nothing here is needed.',
    legacy: [['code', 'code-reference']],
    keywords: ['unraid', 'community apps', 'template', 'store listing', 'publisher profile', 'maintainer', 'ca_profile'],
    lead: (ctx) => {
      const st = ctx.st, project = d.project(st), ml = missingListing(), mp = missingPublisher(), rs = repoSet(st), k = hub(st), on = val(UNRAID_ON) !== false, n = unraidMissing(st);
      const steps = [
        { title: 'What people see in the store', desc: ml.length ? `Still missing: ${andList(ml)}.` : 'The name, the description and the categories are filled in.', done: !ml.length, action: ml.length ? ui.btn({ label: 'Fill it in', go: 'code/publishing/unraid', reveal: LISTING[3] }) : '' },
        { title: 'Who you are in the store', desc: mp.length ? `Still missing: ${andList(mp)}.` : 'Your publisher profile is filled in.', done: !mp.length, action: mp.length ? ui.btn({ label: 'Fill it in', go: 'code/publishing/unraid', reveal: PUBLISHER[1] }) : '' },
        { title: 'A template repository', desc: rs ? 'Set up. The store reads your listing from it.' : 'A small online folder the store reads your listing from. Puppet Master makes one, or uses one you have.', done: rs, action: `<span data-smx-covers="${REPO_SETUP}">${flowBtn(REPO_SETUP, { label: rs ? 'Change it' : 'Set it up', icon: 'archive' })}</span>` },
        { title: 'An image to point at', desc: k.on ? 'Docker Hub is connected, so an image can be published.' : 'The listing points at an image in a registry. Docker Hub is not connected yet.', done: k.on, action: k.on ? '' : ui.btn({ label: 'Docker Hub', go: 'code/publishing/docker-hub' }) }
      ];
      let next = false;
      return [
        { key: 'summary', html: ui.summary({ icon: 'box', tone: n ? 'info' : 'ready', lines: [
          n ? `${ui.b(project)} is not listed in the Unraid app store: ${ui.b(count(n, 'thing'))} ${n === 1 ? 'is' : 'are'} still missing. None of it matters unless you want it listed.` : `${ui.b(project)} has everything the Unraid app store asks for.`,
          on ? `The listing is ${ui.word('brought up to date after each publish', { go: 'code/publishing/unraid', reveal: UNRAID_ON })}.` : `Keeping the listing up to date is ${ui.word('off', { go: 'code/publishing/unraid', reveal: UNRAID_ON })}, so the rows marked “Needed” are not needed now.`
        ] }) },
        { key: 'steps', html: ui.card({ title: 'Getting listed', help: 'Each step turns into a tick by itself.', side: `<span data-smx-covers="${REPO_CHECK}">${flowBtn(REPO_CHECK, { label: 'Check the template repository', icon: 'test' })}</span>`, body: stepList(steps.map((s) => { const isNext = !s.done && !next; if (isNext) next = true; return Object.assign({}, s, { status: s.done ? '' : isNext ? 'Next' : '', tone: 'info' }); })) }) }
      ];
    },
    sections: [
      { key: 'listing', title: 'What people see in the store', help: 'The app’s entry in Community Apps.', ids: LISTING },
      { key: 'publisher', title: 'Who you are in the store', help: 'Your publisher profile. It is shared by your projects unless one has its own.', ids: PUBLISHER }
    ],
    more: [{ key: 'updates', title: 'Keeping the listing up to date', help: 'What happens to the listing each time a new image is published.', ids: [UNRAID_ON, X + 'unraid-manage-repo', X + 'unraid-auto-push'] }],
    moreHelp: 'What happens to the listing after each publish',
    expert: [{ key: 'repo', title: 'The template repository, in detail', help: 'Where it lives, and editing the publisher profile file by hand.', ids: [X + 'unraid-repo-path', X + 'unraid-repo-branch', X + 'unraid-repo-name', X + 'unraid-maintainer-folder', X + 'edit-publisher-xml', X + 'preserve-unknown-xml'] }],
    covers: { [REPO_SETUP]: 'The third step of “Getting listed”: “Set it up”.', [REPO_CHECK]: 'The button “Check the template repository” beside “Getting listed”.' },
    changes: [
      { was: 'The Unraid store is three open cards and a fold on the Containers page (22 rows in all). Seven rows say “Needed”, in no order, and nothing says how many are still missing or that all of it is optional.', now: 'Its own page, reached from one row marked “Optional”. Four steps say what is done and what is still missing, each with the button that does it; the rows follow in the same order.' },
      { was: '“Set up the template repository” and “Check the template repository” are two rows among switches in a card named “Unraid templates”.', now: 'Setting it up is the third step; checking it is the button beside the steps.' },
      { was: 'The panel for store categories says “No categorys yet.”', now: 'The panel is PMConcept7’s own and still says so; the misspelling is listed for its builders.' }
    ]
  });

  /* ================================================================== search: these pages' things, by name */
  (SMX.thingSources = SMX.thingSources || []).push((st) => [
    ...profiles(st).map((p) => ({ title: p.name, sub: 'Code & tools › Testing · test profile', route: `code/testing/${enc(p.id)}` })),
    ...debugs(st).map((x) => ({ title: x.name, sub: 'Code & tools › Debugging · debug profile', route: `code/debug/${enc(x.id)}` })),
    ...recordings().map((fx) => ({ title: fx.title, sub: `Code & tools › Testing › Past test runs · ${lower(recKind(fx)[0])}`, route: `code/test-runs/${enc(fx.id)}` })),
    ...(staysSignedIn() ? sites() : []).map((s) => ({ title: s.name, sub: 'Code & tools › Built-in browser · website sign-in', route: `code/browser/${enc(s.id)}` })),
    ...otherRegs(st).map((r, i) => ({ title: r.label, sub: 'Code & tools › Publishing an app · registry', route: `code/publishing/registry/${i}` }))
  ]);
})(window);
