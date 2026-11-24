/* Refine · the frame around every manager (Concepts/settings-managers/fable-5.2-refine).
   Jared, 2026-11-20: "make the existing managers easier to use/easier to look at/ more digestible"; 2026-11-10:
   "servers/remote access/etc should be its own section, like providers is".
   - Servers & Remote Access is a chapter of its own, right under AI & Providers. It is the same manager with the same
     five tabs; System keeps Settings Transfer, Backup & Restore, Readiness & Doctor, App Updates and Advanced.
     Every old way in (a link, a search hit, a saved place) that names System's servers page lands on the new chapter.
   - Explanations are asked for, not always on. A row is its name and its control; the sentence under it shows when
     "Explain" is on (one button beside Page options, remembered) and in the row's own About panel as before.
   - The rail lists the chapters by name. Its "Essential setup" and "Settings health" boxes repeated Settings Home,
     so the rail keeps one count beside Settings Home instead.
   - Left as they are, because Jared asked for them: the centred tab strips (FO-184) and the side column with its
     scroll highlight (FO-185).
   This file loads after every manager (managers/ is read in name order), so its wrappers see the final markup. */
(function rfFrame() {
  const h = PM51.h, a = PM51.a;

  /* ---- 1. Servers & Remote Access: its own chapter ------------------------------------------------------------ */
  const CHAPTER = 'servers-access';
  (function rfServersChapter() {
    const sys = D.domains.find(d => d.id === 'system');
    if (!sys || D.domains.some(d => d.id === CHAPTER)) return;
    const ws = sys.workspaces.find(w => w.id === 'servers');
    if (!ws) return;
    sys.workspaces = sys.workspaces.filter(w => w !== ws);
    if (sys.defaultWorkspace === 'servers') sys.defaultWorkspace = (sys.workspaces[0] || {}).id;
    sys.summary = 'Settings transfer, backups, readiness, and updates.';
    ws.label = 'Servers & Remote Access';
    const at = D.domains.findIndex(d => d.id === 'ai');
    D.domains.splice(at < 0 ? 1 : at + 1, 0, {
      id: CHAPTER, label: 'Servers & Remote Access', icon: 'network',
      summary: 'Your server, your devices, and reaching them away from home.',
      defaultWorkspace: 'servers', workspaces: [ws]
    });
    if (state && state.workspace === 'servers') state.domain = CHAPTER;
    allSettingsCatalogCache = null; searchIndexDirty = true;
  })();
  /* a manager is found by its own name wherever the caller thinks it lives */
  const rfNavigate = navigate;
  navigate = function (domainId, workspaceId, options) {
    if (workspaceId) { const owner = D.domains.find(d => d.workspaces.some(w => w.id === workspaceId)); if (owner) domainId = owner.id; }
    return rfNavigate.call(this, domainId, workspaceId, options);
  };

  /* ---- 2. Explanations on request ----------------------------------------------------------------------------- */
  const explainOn = () => !!PM51.s().rfExplain;
  const paintExplain = () => {
    root.setAttribute('data-rf-explain', explainOn() ? 'on' : 'off');
    root.querySelectorAll('[data-action="pm51-rf-explain"]').forEach(b => { b.setAttribute('aria-pressed', explainOn() ? 'true' : 'false'); b.classList.toggle('is-on', explainOn()); });
  };
  PM51.on('rf-explain', () => { PM51.s().rfExplain = !explainOn(); saveState(); paintExplain(); });
  const rfChrome = renderChromeActions;
  renderChromeActions = function (extra) {
    const btn = `<button type="button" class="btn rf-explain${explainOn() ? ' is-on' : ''}" data-action="pm51-rf-explain" aria-pressed="${explainOn() ? 'true' : 'false'}" data-pm-hover-label="Explain" data-pm-hover-detail="Show a sentence under every setting and section.">${icon('info')}<span>Explain</span></button>`;
    return rfChrome.call(this, btn + (extra || ''));
  };
  paintExplain();

  /* ---- 3. The rail: chapters by name, one count for what needs you ------------------------------------------- */
  const rfRail = renderDomainRail;
  renderDomainRail = function () {
    let html = String(rfRail.apply(this, arguments));
    const m = html.match(/(\d+) items? needs? attention/);
    const from = html.indexOf('<div class="rail-heading">Essential setup</div>');
    const end = html.lastIndexOf('</div>', html.lastIndexOf('</aside>'));
    if (from > 0 && end > from) html = html.slice(0, from) + html.slice(end);
    if (m) html = html.replace('<span class="side-link-label">Settings Home</span>', `<span class="side-link-label">Settings Home</span><span class="rf-rail-count" data-pm-hover-label="${a(m[1])} need attention" data-pm-hover-detail="Open Settings Home to see them.">${h(m[1])}</span>`);
    return html;
  };
  /* ---- 4. One tab strip per level, and no strip for a chapter with one manager -------------------------------- */
  const rfTabs = renderWorkspaceTabs;
  renderWorkspaceTabs = function (domain, activeWorkspace) {
    /* the strip stays in the page, unseen: the engine and stream F's checks look for the lit tab of the chapter */
    const html = String(rfTabs.call(this, domain, activeWorkspace));
    return domain && domain.workspaces.length < 2 ? html.replace('class="workspace-tabs"', 'class="workspace-tabs rf-one"') : html;
  };

  /* the first manager's name is already lit in the strip above it; later managers keep theirs as the page scrolls on */
  const rfContinuous = renderDomainContinuous;
  renderDomainContinuous = function (domain) {
    const html = String(rfContinuous.apply(this, arguments));
    if (!domain || domain.workspaces.length < 2) return html;
    return html.replace('<header class="workspace-separator"><h2>', '<header class="workspace-separator rf-first"><h2 class="rf-first-title">');
  };

  /* ---- 5. The side column ("On this page") is left exactly as it is. A first pass hid it on managers with tabs;
     Jared had asked for its highlight to follow the scroll (FO-185, 2026-11-13), so it is his, not a repeat to cut.
     The same goes for the centred tab strips (FO-184). ---- */
  const rfRender = renderApp;
  renderApp = function () { const r = rfRender.apply(this, arguments); paintExplain(); return r; };

  /* ---- 6. Facts: what is true right now, on one line (not rows that look like settings) ----------------------- */
  /* A short value ("4 rules", "5 protected") is placed by its own width, as a one-word value already is. The kit gave
     every other value 14 characters of room beside its button; a shorter value then pushed the button under itself
     (Permissions: "4 rules" over "See rules"; Formatters: "Ready to format" over "Check formatter"). */
  const oneWord0 = PM51.oneWord;
  PM51.oneWord = v => oneWord0(v) || (v != null && String(v).trim().length > 0 && String(v).trim().length <= 18);
  PM51.facts = (items, { action } = {}) => `<div class="rf-facts">${items.filter(Boolean).map(f => `<span class="rf-fact${f.tone ? ' tone-' + a(f.tone) : ''}">${f.pill || ''}${f.label ? `<span class="rf-fact-label">${h(f.label)}</span>` : ''}${f.value != null ? `<span class="rf-fact-value">${h(String(f.value))}</span>` : ''}${f.end || ''}</span>`).join('')}${action ? `<span class="rf-facts-end">${typeof action === 'string' ? action : PM51.btn(Object.assign({ small: true }, action))}</span>` : ''}</div>`;
})();

/* Refine · the example says what you just changed (Editor and Terminal Customize, Customize Pip, Adjust NieR).
   Jared, 2026-11-10: "make sure that example section actually shows what is being changed". The example already
   redraws on every change; some changes are a few pixels. A line under the example now names the thing changed, and
   the example wears a ring for a moment so the eye goes to it. It reads the control that was used, so it needs no
   list of options and cannot drift from them. */
(function rfChanged() {
  const T = s => String(s || '').replace(/\s+/g, ' ').trim();
  const line = (after, cls) => {
    let el = after.parentElement.querySelector(':scope > .rf-changed');
    if (!el) { el = document.createElement('div'); el.className = 'rf-changed'; el.setAttribute('role', 'status'); after.insertAdjacentElement('afterend', el); }
    return el;
  };
  const show = (picture, text, note) => {
    if (!picture || !picture.isConnected || !text) return;
    /* under the scenes when the picture has them, so the line is not pushed between the two */
    const scenes = picture.parentElement.querySelector(':scope > .rf-where');
    const el = line(scenes || picture);
    el.innerHTML = '<i>Changed</i><b></b>' + (note ? '<small></small>' : '');
    el.querySelector('b').textContent = text;
    if (note) el.querySelector('small').textContent = note;
    picture.classList.add('rf-pulse'); clearTimeout(picture.__rfT); picture.__rfT = setTimeout(() => picture.classList.remove('rf-pulse'), 900);
  };
  /* ---- Editor and Terminal Customize ---- */
  const czName = el => {
    const field = el.closest('.pmt-cz-field');
    const fl = field && field.querySelector('.pmt-cz-flabel');
    if (fl) return T(fl.textContent);
    const group = el.closest('.pmt-cz-group');
    const g = group ? T((group.querySelector('.pmt-cz-ghead h3, .pmt-cz-ghead h4, h3, h4') || {}).textContent) : '';
    const pick = el.closest('.pmt-cz-tile, .pmt-cz-scheme, .pmt-cz-chipbox, .pmt-cz-chip, .pmt-cz-segopt, .pmt-cz-swatch');
    if (pick) {
      /* its own name element first: a scheme's thumbnail holds bold code words that are not its name */
      const n = pick.querySelector('.pmt-cz-tname') || pick.querySelector('.pmt-cz-chipname') || pick.querySelector('.pmt-cz-pname');
      const name = T(n ? n.textContent : (pick.getAttribute('aria-label') || '')).slice(0, 56);
      return g && name ? `${g} · ${name}` : (name || g);
    }
    return T(el.getAttribute('aria-label')) || g;
  };
  const onCz = e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    const dialog = t.closest('.pmt-cz-dialog'); if (!dialog) return;
    const inBody = t.closest('.pmt-cz-body'), preset = t.closest('.pmt-cz-set');
    if (!inBody || t.closest('.pmt-cz-nav, .pmt-cz-search, .pmt-cz-try') || (t.closest('.pmt-cz-top') && !preset)) return;
    const ctl = t.closest('button, input, select, [role=switch], [role=radio], [role=slider]'); if (!ctl) return;
    if (e.type === 'click' && ctl.matches('input, select')) return;
    if (e.type === 'click' && !(ctl.matches('[aria-checked], [aria-pressed], [role=switch], [role=radio]') || ctl.closest('.pmt-cz-stepper, .pmt-cz-seg, .pmt-cz-swatches, .pmt-cz-tiles, .pmt-cz-schemes, .pmt-cz-chips'))) return;
    const name = preset ? `Preset · ${T((preset.querySelector('.pmt-cz-pname') || preset.querySelector('b, strong') || preset.firstElementChild || preset).textContent).slice(0, 40)}` : czName(ctl);
    setTimeout(() => show(dialog.querySelector('.pmt-cz-top > .pmt-cz-preview'), name), 80);
  };
  /* ---- Customize Pip, Adjust NieR ---- */
  const onParts = e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    const chip = t.closest('.pipe-chip, .o55nc-chip'), preset = t.closest('.pipe-preset, .o55nc-preset'); if (!chip && !preset) return;
    const host = t.closest('.pipe, .o55nc'); if (!host) return;
    const pip = host.classList.contains('pipe');
    setTimeout(() => {
      const picture = host.querySelector(pip ? '.pipe-top .pipe-stage' : '.o55nc-top .o55nc-pv, .o55nc-top > :first-child');
      if (preset) { show(picture, `Preset · ${T((preset.querySelector('span') || preset).textContent)}`); return; }
      const name = T((chip.querySelector('.pipe-chip-name, .o55nc-chip-name') || chip).textContent);
      const state = T((chip.querySelector('.pipe-chip-state, .o55nc-chip-state') || {}).textContent);
      const group = chip.closest('[data-pipe-group], [data-o55nc-group]');
      /* a place Pip appears has its own small scene under the team: the ring goes there */
      const scene = pip && chip.dataset.pipePart ? host.querySelector(`.rf-where-tile[data-rf-where="${chip.dataset.pipePart}"]`) : null;
      if (scene) { show(picture, `${name}${state ? ' · ' + state : ''}`); picture.classList.remove('rf-pulse'); scene.classList.add('rf-pulse'); clearTimeout(scene.__rfT); scene.__rfT = setTimeout(() => scene.classList.remove('rf-pulse'), 900); return; }
      show(picture, `${name}${state ? ' · ' + state : ''}`);
    }, 80);
  };
  document.addEventListener('click', e => { onCz(e); onParts(e); }, true);
  document.addEventListener('input', onCz, true);
  document.addEventListener('change', onCz, true);

  /* ---- the chapter's name is the same wherever Settings mentions it ----------------------------------------------
     The manager was called "Server & Project Location"; a few sentences elsewhere in Settings still sent people there
     (Containers, Readiness & Doctor). They name the chapter as it is now. The words outside Settings (the first-run
     tour, Pip) are PMConcept7's own copy files and are listed in the README for the merge. */
  (function rfChapterName() {
    const OLD = /Server (?:&|and) Project Location/g, NEW = 'Servers & Remote Access';
    const seen = new WeakSet();
    const walk = o => {
      if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
      for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { if (OLD.test(v)) o[k] = v.replace(OLD, NEW); OLD.lastIndex = 0; } else if (v && typeof v === 'object') walk(v); }
    };
    try { walk(DATA); walk(PM51.placement); walk(D.domains.filter(d => d.id !== CHAPTER)); } catch (_) { /* a frozen object: its words stay */ }
  })();

  /* ---- "Add" shows what there is to add (Jared, 2026-11-23: Providers' "add a new service pop up menu is not at all
     sufficient"; the new sheet "looks good"; "apply it to all the managers") --------------------------------------
     Two more managers opened a bare form whose first field was a closed "Type" list: a newcomer had to open the list
     to learn what could be added at all. Their Add now opens the same sheet as Providers: every kind, grouped, with
     what it is and what it will ask for. Picking one goes on to the same form as before, with that kind chosen. */
  const rfPicks = {};
  function rfCatalogue({ id, title, search, groups, none }) {
    const row = r => `<div class="rf-add-row" data-rf-add-text="${a(`${r.name} ${r.how || ''}`.toLowerCase())}">
      <span class="resource-avatar rf-add-mark">${r.icon ? icon(r.icon) : h(PM51.initials(String(r.name).replace(/[^A-Za-z0-9 ]+/g, ' ')))}</span>
      <span class="rf-add-copy"><b class="rf-add-name">${h(r.name)}</b><small class="rf-add-how">${h(r.how || '')}</small></span>
      <span class="rf-add-state rf-add-needs">${h(r.needs || '')}</span>
      ${PM51.btn({ label: 'Add', small: true, action: 'pm51-rf-cat-pick', data: { cat: id, pick: r.id, group: r.group || '' } })}
    </div>`;
    PM51.panel({
      title, icon: 'plus', width: 720, cls: 'rf-add-panel', closeLabel: 'Close',
      body: `<div class="rf-add">
        ${search ? `<div class="rf-add-search"><input type="search" class="rf-add-input" placeholder="${a(search)}" aria-label="${a(search)}" data-action="pm51-rf-cat-filter" autocomplete="off"/></div>` : ''}
        ${groups.filter(g => g.rows.length).map(g => `<section class="rf-add-group"><h4 class="rf-add-title">${h(g.label)}<i class="rf-add-n">${g.rows.length}</i></h4>${g.rows.map(row).join('')}</section>`).join('')}
        <p class="rf-add-none" hidden>${h(none || 'Nothing by that name.')}</p>
      </div>`
    });
    if (search) requestAnimationFrame(() => { const i = document.querySelector('.rf-add-panel .rf-add-input'); if (i) i.focus({ preventScroll: true }); });
  }
  PM51.on('rf-cat-pick', el => { const fn = rfPicks[el.dataset.cat]; if (fn) fn(el.dataset.pick, el.dataset.group); });
  PM51.onInput('rf-cat-filter', el => {
    const q = String(el.value || '').trim().toLowerCase(), box = el.closest('.rf-add'); if (!box) return;
    let shown = 0;
    box.querySelectorAll('.rf-add-group').forEach(g => {
      let n = 0;
      g.querySelectorAll('.rf-add-row').forEach(r => { const hit = !q || (r.getAttribute('data-rf-add-text') || '').includes(q); r.hidden = !hit; if (hit) n++; });
      g.hidden = !n; shown += n;
    });
    const none = box.querySelector('.rf-add-none'); if (none) none.hidden = shown > 0;
  });
  /* the form that was there before, opened with one of its lists already set */
  const rfSetSelect = (name, value) => {
    const sel = document.querySelector(`.overlay select[name="${name}"]`); if (!sel) return null;
    if (![...sel.options].some(o => o.value === value)) return sel;
    sel.value = value; sel.dispatchEvent(new Event('change', { bubbles: true }));
    return sel;
  };
  const rfRetitle = text => { const t = document.querySelector('.overlay .dialog-title'); if (t) t.textContent = text; };

  /* Notifications › Destinations › Add */
  (function rfNotifyAdd() {
    const form = actions['notifications-add-dest']; if (!form) return;
    const KINDS = {
      'In-app': { g: 'here', icon: 'bell', how: 'The Activity center inside Puppet Master', needs: 'Nothing to set up' },
      'System / tray': { g: 'here', icon: 'bell', how: 'Your computer\'s own notifications', needs: 'Nothing to set up' },
      'Slack': { g: 'chat', how: 'A channel in your Slack', needs: 'A webhook address' },
      'Discord': { g: 'chat', how: 'A channel on your Discord server', needs: 'A webhook address' },
      'Telegram': { g: 'chat', how: 'A chat with your own bot', needs: 'A chat id' },
      'ntfy': { g: 'phone', how: 'Free push alerts to your phone', needs: 'A topic name' },
      'Pushover': { g: 'phone', how: 'Push alerts to your phone', needs: 'A user key' },
      'Generic webhook': { g: 'other', icon: 'external', how: 'Any service that accepts a web address', needs: 'A web address' }
    };
    const GROUPS = [['here', 'On this computer'], ['chat', 'Chat apps'], ['phone', 'Your phone'], ['other', 'Anything else']];
    const types = () => Object.assign({}, DATA.notifications || {}, PM51.s().notifications || {}).destinationTypes || Object.keys(KINDS);
    PM51.on('notifications-add-dest', () => rfCatalogue({
      id: 'notify', title: 'Add a destination', search: 'Search destinations', none: 'No destination by that name.',
      groups: GROUPS.map(([gid, label]) => ({ label, rows: types().filter(t => ((KINDS[t] || {}).g || 'other') === gid).map(t => Object.assign({ id: t, name: t === 'In-app' ? 'In this app' : t === 'System / tray' ? 'System notifications' : t === 'Generic webhook' ? 'Another service (webhook)' : t }, KINDS[t] || { how: 'A service that accepts a web address', needs: 'A web address' })) }))
    }));
    rfPicks.notify = type => {
      form();
      rfSetSelect('type', type);
      const k = KINDS[type] || {}, builtIn = k.g === 'here';
      rfRetitle(type === 'In-app' ? 'Add in-app alerts' : type === 'System / tray' ? 'Add system notifications' : `Add ${type}`);
      /* a destination on this computer has no address to give, so the form does not ask for one */
      const addr = document.querySelector('.overlay [name="address"]'), field = addr && addr.closest('.form-field');
      if (builtIn && field) field.style.display = 'none';
      if (!builtIn && addr && k.needs) addr.setAttribute('placeholder', k.needs);
    };
  })();

  /* Backup & Restore › Destinations › Add */
  (function rfBackupAdd() {
    const form = actions['backup-dest-add']; if (!form) return;
    const HOW = {
      'Google Drive': 'Your Google account\'s storage', 'Microsoft OneDrive': 'Your Microsoft account\'s storage',
      'Amazon S3': 'A bucket in your AWS account', 'S3-compatible storage': 'MinIO, Wasabi, Cloudflare R2 and others', 'Backblaze B2': 'A B2 bucket',
      'Azure Blob Storage': 'A container in your Azure account', 'Google Cloud Storage': 'A bucket in your Google Cloud project',
      'Folder / NAS share': 'A shared folder on a NAS or another computer', 'SFTP server': 'Any computer you can reach over SSH',
      'WebDAV / Nextcloud': 'Your own Nextcloud, or any WebDAV server', 'Self-hosted backup server': 'A backup server you run yourself'
    };
    const NEEDS = { 'Cloud account': 'Signing in on its page', 'Storage bucket': 'A key and a bucket name', 'Another computer or NAS': 'Its address and a folder', 'Self-hosted storage': 'Its address and a sign-in' };
    const families = () => (PM51.s().backup || {}).destinationFamilies || [];
    PM51.on('backup-dest-add', () => {
      const fam = families(); if (!fam.length) return form();
      rfCatalogue({
        id: 'backup', title: 'Add a backup destination', search: 'Search places to keep backups', none: 'No place by that name.',
        groups: fam.map(([family, services]) => ({ label: family, rows: services.map(sv => ({ id: sv, group: family, name: sv, how: HOW[sv] || family, needs: NEEDS[family] || '' })) }))
      });
    });
    rfPicks.backup = (service, family) => {
      form();
      rfSetSelect('family', family); rfSetSelect('type', service);
      rfRetitle(`Add ${service}`);
    };
  })();
})();
