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
    if (domain && domain.workspaces.length < 2) return '<div class="rf-no-chapter-tabs"></div>';
    return rfTabs.call(this, domain, activeWorkspace);
  };

  /* the first manager's name is already lit in the strip above it; later managers keep theirs as the page scrolls on */
  const rfContinuous = renderDomainContinuous;
  renderDomainContinuous = function (domain) {
    const html = String(rfContinuous.apply(this, arguments));
    if (!domain || domain.workspaces.length < 2) return html;
    return html.replace('<header class="workspace-separator"><h2>', '<header class="workspace-separator rf-first"><h2 class="rf-first-title">');
  };

  /* ---- 5. "On this page" only where a page is long ------------------------------------------------------------
     The column listed every manager of the chapter and every tab of each, which the two tab strips already do.
     It now lists the groups of the page in view, and only for a page without tabs that has four groups or more
     (App & Input, Editor & Terminal, Containers...). Elsewhere the page takes the column's width. */
  const rfIndexWanted = () => {
    if (state.home) return false;
    const w = getDomain().workspaces.find(x => x.id === state.workspace);
    if (!w || pm51HasTabs(w)) return false;
    return (domainSectionMap[w.id] || []).filter(s => !s.advanced && !pm51IsMain(w.id, s.id)).length >= 4;
  };
  const rfPaintIndex = () => {
    root.setAttribute('data-rf-index', rfIndexWanted() ? 'on' : 'off');
    root.querySelectorAll('.pm51-index-group').forEach(g => g.classList.toggle('rf-here', g.dataset.indexWs === state.workspace));
  };
  const rfMark = pm51MarkIndex;
  pm51MarkIndex = function () { const r = rfMark.apply(this, arguments); rfPaintIndex(); return r; };
  const rfRender = renderApp;
  renderApp = function () { const r = rfRender.apply(this, arguments); paintExplain(); rfPaintIndex(); return r; };

  /* ---- 6. Facts: what is true right now, on one line (not rows that look like settings) ----------------------- */
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
    const el = line(picture);
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
    const g = group ? T((group.querySelector('.pmt-cz-ghead, h3, h4') || {}).textContent) : '';
    const pick = el.closest('.pmt-cz-tile, .pmt-cz-scheme, .pmt-cz-chipbox, .pmt-cz-chip, .pmt-cz-segopt, .pmt-cz-swatch');
    if (pick) {
      const n = pick.querySelector('.pmt-cz-tname, .pmt-cz-chipname, strong, b');
      const name = T(n ? n.textContent : (pick.getAttribute('aria-label') || pick.textContent)).slice(0, 56);
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
    const name = preset ? `Preset · ${T((preset.querySelector('b, strong, .pmt-cz-pname') || preset).textContent).slice(0, 40)}` : czName(ctl);
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
      const where = pip && group && /where/i.test(group.getAttribute('data-pipe-group') || '');
      show(picture, `${name}${state ? ' · ' + state : ''}`, where ? 'Where Pip appears shows in the chat itself, not in this picture.' : '');
    }, 80);
  };
  document.addEventListener('click', e => { onCz(e); onParts(e); }, true);
  document.addEventListener('input', onCz, true);
  document.addEventListener('change', onCz, true);
})();
