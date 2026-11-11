/* Settings managers, rethought (Fable 5.2): the parts pages are made of, search, and the two review panels.
   Every part returns HTML. Parts that hold a real control use the Settings kit's own builders (PM51), so the control is
   PMConcept7's and follows every look. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX || SMX.ui) return;
  const kit = () => W.PM51;
  const h = SMX.h, data = SMX.data;
  const ui = SMX.ui = {};

  /* ------------------------------------------------------------------ buttons and links
     action: one of PMConcept7's own actions (the Settings engine handles the click). go: a page of the redesign.
     do: one of this concept's handlers (SMX.act). */
  const target = (o) => (o.action ? ` data-action="${h(o.action)}"${data(o.data)}` : o.go ? ` data-smx-go="${h(o.go)}"${o.reveal ? ` data-smx-reveal="${h(o.reveal)}"` : ''}${o.anchor ? ` data-smx-anchor-to="${h(o.anchor)}"` : ''}` : o.do ? ` data-smx-do="${h(o.do)}"${data(o.data)}` : '');
  ui.btn = (o) => {
    if (o.disabled) return `<button type="button" class="btn pm51-btn${o.small === false ? '' : ' small'}${o.ghost ? ' ghost' : ''}${o.label ? '' : ' smx-icon-only'}" data-action="pm51-disabled" aria-disabled="true" data-pm51-disabled="1" data-disabled-reason="${h(o.reason || 'Not available here.')}" data-pm-hover-label="${h(o.label || o.label2 || '')}" data-pm-hover-detail="${h(o.reason || 'Not available here.')}"${o.label2 ? ` aria-label="${h(o.label2)}"` : ''}>${o.icon ? SMX.icon(o.icon) : ''}${o.label ? `<span>${h(o.label)}</span>` : ''}</button>`;
    return `<button type="button" class="btn pm51-btn${o.primary ? ' primary' : ''}${o.small === false ? '' : ' small'}${o.ghost ? ' ghost' : ''}${o.danger ? ' danger' : ''}${o.label ? '' : ' smx-icon-only'}${o.cls ? ' ' + o.cls : ''}"${target(o)}${o.key ? ` data-smx-key="${h(o.key)}"` : ''}${o.label2 ? ` aria-label="${h(o.label2)}" data-pm-hover-label="${h(o.label2)}"` : ''}>${o.icon ? SMX.icon(o.icon) : ''}${o.label ? `<span>${h(o.label)}</span>` : ''}</button>`;
  };
  ui.link = (o) => `<button type="button" class="pm51-link"${target(o)}>${h(o.label)}</button>`;
  ui.links = (items) => `<div class="pm51-quiet smx-links">${items.filter(Boolean).map(ui.link).join('')}</div>`;
  ui.status = (text, tone) => { try { return kit().status(text, tone ? SMX.tone(tone) : undefined); } catch (e) { return h(text); } };
  ui.note = (text, tone) => { try { return kit().note(text, tone); } catch (e) { return `<p>${h(text)}</p>`; } };
  ui.facts = (pairs) => { try { return kit().kv(pairs); } catch (e) { return ''; } };
  ui.meter = (o) => { try { return kit().meter(o); } catch (e) { return ''; } };
  ui.tag = (text) => `<span class="pm51-tag">${h(text)}</span>`;

  /* ------------------------------------------------------------------ cards and rows (the kit's own section and row shapes) */
  ui.card = ({ title, help, side, body, cls, anchor, tone }) => `<section class="panel-card pm51-section${cls ? ' ' + cls : ''}${tone ? ' tone-' + h(tone) : ''}"${anchor ? ` data-smx-anchor="${h(anchor)}"` : ''}>${title || side ? `<div class="pm51-section-head"><div class="pm51-section-copy">${title ? `<h3 class="pm51-section-title">${h(title)}</h3>` : ''}${help ? `<p class="pm51-section-help">${h(help)}</p>` : ''}</div>${side || ''}</div>` : ''}${body ? `<div class="pm51-section-body">${body}</div>` : ''}</section>`;
  ui.rows = (rows) => `<div class="pm51-rows">${rows.filter(Boolean).map((r) => `<div class="pm51-row${r.cls ? ' ' + r.cls : ''}"${r.covers ? ` data-smx-covers="${h(r.covers)}"` : ''}><div class="pm51-row-copy"><div class="pm51-row-label">${h(r.label)}${r.status ? ' ' + r.status : ''}</div>${r.help ? `<div class="pm51-row-help">${h(r.help)}</div>` : ''}</div><div class="pm51-row-control">${r.value != null ? `<span class="pm51-row-value${r.muted ? ' is-muted' : ''}">${h(String(r.value))}</span>` : ''}${r.control || ''}</div></div>`).join('')}</div>`;
  /* the kit's own rows for setting ids, as one card */
  ui.settings = (ids, o = {}) => { try { return kit().settingRows(ids.filter(SMX.has), { title: o.title || '', help: o.help || '' }); } catch (e) { return ''; } };
  ui.setting = (id, o) => { try { return kit().bound.row(id, o || {}); } catch (e) { return ''; } };
  ui.select = (id, o) => { try { return kit().bound.select(id, o || {}); } catch (e) { return ''; } };
  ui.toggle = (id, o) => { try { return kit().bound.toggle(id, o || {}); } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ decided on another page
     Every setting has one home. Where it also matters, the page says it in words and the row goes to its home:
     ui.elsewhere(['setting.id', ['Name', 'value in words', 'route', 'setting.id or empty'], {id, name, value}], {title, help}).
     A setting id alone gets its own label and value. A section takes the same list as `also: [...]`. */
  SMX.valueText = (id) => { let t = ''; try { t = String(kit().valueText(kit().setting(id), kit().value(id))); } catch (e) { const v = SMX.val(id); t = v == null ? '' : String(v); } const ow = ((SMX.words || {})[id] || {}).options; if (ow && ow[t]) t = ow[t]; return /^(true|on)$/i.test(t) ? 'On' : /^(false|off)$/i.test(t) ? 'Off' : t.length > 64 ? t.slice(0, 62) + '…' : t; };
  ui.elsewhere = (rows, o = {}) => {
    const list = (rows || []).filter(Boolean).map((r) => {
      if (typeof r === 'string') r = { id: r };
      else if (Array.isArray(r)) r = { name: r[0], value: r[1], go: r[2], id: r[3] || '' };
      if (r.id && !SMX.has(r.id)) return '';
      const w = r.id ? SMX.where(r.id) : null;
      const to = w ? w.route : r.go;
      if (!to || to === o.here) return '';   // its home is this very page: the row itself is here
      const name = r.name || SMX.labelOf(r.id), v = r.value != null ? String(r.value) : (r.id ? SMX.valueText(r.id) : '');
      return `<div class="smx-thing is-clickable" role="button" tabindex="0" data-smx-go="${h(to)}"${r.id ? ` data-smx-reveal="${h(r.id)}"` : ''}><span class="smx-thing-copy"><span class="smx-thing-name">${h(name)}</span><span class="smx-thing-sub">${v ? `${h(v)} · ` : ''}${h(SMX.pageName(to))}</span></span><span class="smx-thing-end"><span class="smx-thing-go">${SMX.icon('go')}</span></span></div>`;
    }).filter(Boolean);
    if (!list.length) return '';
    return ui.card({ cls: 'smx-things-card smx-elsewhere', title: o.title || 'Decided on other pages', help: o.help != null ? o.help : 'Each of these has one home. It is listed here so you can see it; the row takes you there.', body: `<div class="smx-things">${list.join('')}</div>` });
  };

  /* ------------------------------------------------------------------ the summary: what is set up, in a sentence or two */
  ui.summary = ({ icon, tone, lines, side }) => `<section class="smx-summary tone-${SMX.tone(tone || 'ready')}">${icon ? `<div class="smx-summary-icon">${SMX.icon(icon)}</div>` : ''}<div class="smx-summary-copy">${lines.filter(Boolean).map((l, i) => `<p class="${i === 0 ? 'smx-summary-lead' : 'smx-summary-line'}">${l}</p>`).join('')}</div>${side ? `<div class="smx-summary-side">${side}</div>` : ''}</section>`;
  /* a word inside a sentence that takes you to where it is changed */
  ui.word = (text, o) => `<button type="button" class="smx-word"${target(o)}>${h(text)}</button>`;
  ui.b = (text) => `<strong>${h(text)}</strong>`;

  /* ------------------------------------------------------------------ what needs you: one line and one way forward each */
  /* What needs the person is counted and said ONE way (review R1, F3: a summary said 2, the list under it 3, and two
     chapter cards counted differently again). Things that stop something "need you"; things that do not (an account
     you signed out of, an update that is ready) are "worth a look". The title, a chapter's card and the mark beside a
     chapter in the list on the left all use these words. */
  SMX.needWords = (list) => {
    const hard = list.filter((n) => n && n.tone !== 'info').length, soft = list.filter(Boolean).length - hard;
    const t = (n, one, many) => (n === 1 ? one : `${n} ${many}`);
    return { hard, soft,
      title: hard && soft ? `${t(hard, 'One thing needs', 'things need')} you, and ${t(soft, 'one more is', 'more are')} worth a look` : hard ? `${t(hard, 'One thing needs', 'things need')} you` : soft ? `${t(soft, 'One thing is', 'things are')} worth a look` : 'Nothing needs you',
      short: hard ? `${hard} need${hard === 1 ? 's' : ''} you` : soft ? `${soft} to look at` : '' };
  };
  ui.needs = (items, o = {}) => {
    const every = items.filter(Boolean); if (!every.length) return '';
    // what stops something comes first; a long list is cut and says how many more there are, and where
    const sorted = every.filter((n) => n.tone !== 'info').concat(every.filter((n) => n.tone === 'info'));
    const list = o.max && sorted.length > o.max ? sorted.slice(0, o.max) : sorted;
    const rest = sorted.length - list.length;
    return `<section class="smx-needs" aria-label="Needs you"><h3 class="smx-needs-title">${SMX.icon('alert')}<span>${h(SMX.needWords(every).title)}</span></h3>${list.map((n) => `<div class="smx-need tone-${SMX.tone(n.tone || 'attention')}"><div class="smx-need-copy"><div class="smx-need-title">${h(n.title)}</div>${n.detail ? `<div class="smx-need-detail">${h(n.detail)}</div>` : ''}</div>${n.fix ? ui.btn(Object.assign({ primary: true }, n.fix)) : ''}${n.also ? ui.link(n.also) : ''}</div>`).join('')}${rest > 0 ? `<p class="smx-needs-more">${h(o.more || `${rest} more ${rest === 1 ? 'is' : 'are'} on the chapters marked with a dot in the list on the left.`)}</p>` : ''}</section>`;
  };

  /* Every need of every chapter, from the functions the chapters add to SMX.needSources. A need belongs to the chapter
     that reports it (the function carries `chapter`), unless the need names one itself (the checkup reports things
     that other chapters fix). SMX.chapterStatus is a chapter's state for its card on Home and its mark in the list on
     the left: what needs you there, counted this one way, comes before the chapter's own words. */
  const chapterOfRoute = (r) => { if (!r) return ''; const m = SMX.match(String(r)); return m ? m.page.chapter : String(r).split('/')[0]; };
  SMX.needsAll = (st) => {
    const out = [];
    for (const f of (SMX.needSources || [])) {
      let list = []; try { list = f(st) || []; } catch (e) { list = []; }
      for (const n of list) if (n) { if (!n.chapter) n.chapter = f.chapter || chapterOfRoute((n.fix && n.fix.go) || (n.also && n.also.go)); out.push(n); }
    }
    return out;
  };
  SMX.needsOf = (chapterId, st) => SMX.needsAll(st).filter((n) => n.chapter === chapterId);
  SMX.chapterStatus = (c, ctx) => {
    const w = SMX.needWords(SMX.needsOf(c.id, ctx.st));
    let own = null; try { own = c.status ? c.status(ctx) : null; } catch (e) { own = null; }
    if (w.hard) return { tone: 'attention', text: w.short };
    if (own && own.tone === 'off') return own;   // "Off" is said before "2 to look at"
    if (w.soft) return { tone: 'info', text: w.short };
    return own;
  };

  /* ------------------------------------------------------------------ tasks: the few things people come here to do */
  ui.tasks = (items, o = {}) => {
    const list = items.filter(Boolean); if (!list.length) return '';
    return `<section class="smx-tasks"${o.anchor ? ` data-smx-anchor="${h(o.anchor)}"` : ''}>${o.title ? `<h3 class="smx-kicker">${h(o.title)}</h3>` : ''}<div class="smx-task-grid cols-${Math.min(4, o.cols || list.length)}">${list.map((t) => `<button type="button" class="smx-task"${target(t)}><span class="smx-task-icon">${SMX.icon(t.icon || 'arrowRight')}</span><span class="smx-task-copy"><span class="smx-task-title">${h(t.title)}</span>${t.sub ? `<span class="smx-task-sub">${h(t.sub)}</span>` : ''}</span><span class="smx-task-go">${SMX.icon('arrowRight')}</span></button>`).join('')}</div></section>`;
  };

  /* ------------------------------------------------------------------ things: the list of what you have
     item: {icon | initials, name, tag, sub, sub2, status: {text, tone}, meters: html, go | action+data, side: html} */
  ui.things = ({ title, help, add, items, empty, anchor, cls }) => {
    const list = (items || []).filter(Boolean);
    const body = list.length ? `<div class="smx-things${cls ? ' ' + cls : ''}">${list.map((it) => {
      const open = it.go || it.action || it.do;
      const head = `<span class="smx-thing-avatar${it.icon ? '' : ' is-initials'}">${it.icon ? SMX.icon(it.icon) : h(it.initials || '?')}</span><span class="smx-thing-copy"><span class="smx-thing-name">${h(it.name)}${it.tag ? ` <span class="smx-thing-tag">${h(it.tag)}</span>` : ''}</span>${it.sub ? `<span class="smx-thing-sub">${h(it.sub)}</span>` : ''}${it.sub2 ? `<span class="smx-thing-sub">${h(it.sub2)}</span>` : ''}${it.meters ? `<span class="smx-thing-meters">${it.meters}</span>` : ''}</span>`;
      const end = `<span class="smx-thing-end">${it.status ? ui.status(it.status.text, it.status.tone) : ''}${it.side || ''}${open ? `<span class="smx-thing-go">${SMX.icon('go')}</span>` : ''}</span>`;
      return open ? `<div class="smx-thing is-clickable" role="button" tabindex="0"${target(it)}>${head}${end}</div>` : `<div class="smx-thing">${head}${end}</div>`;
    }).join('')}</div>` : (empty ? `<div class="smx-empty">${SMX.icon(empty.icon || 'info')}<div class="smx-empty-title">${h(empty.title)}</div>${empty.text ? `<div class="smx-empty-text">${h(empty.text)}</div>` : ''}${empty.fix ? ui.btn(Object.assign({ primary: true }, empty.fix)) : ''}</div>` : '');
    return ui.card({ title, help, side: add ? ui.btn(Object.assign({ icon: 'plus' }, add)) : '', body, anchor, cls: 'smx-things-card' });
  };

  /* ------------------------------------------------------------------ a chapter's pages, as described rows */
  ui.pages = (chapterId, ctx, o = {}) => {
    const pages = SMX.pages.filter((p) => p.chapter === chapterId && p.nav && p.id !== chapterId && !p.id.includes(':'));
    if (!pages.length) return '';
    return `<section class="smx-pages">${o.title ? `<h3 class="smx-kicker">${h(o.title)}</h3>` : ''}<div class="smx-page-list">${pages.map((p) => {
      let st = null; try { st = p.status ? p.status(ctx) : null; } catch (e) { st = null; }
      const blurb = typeof p.blurb === 'function' ? p.blurb(ctx) : (p.blurb || p.purpose || '');
      return `<button type="button" class="smx-page-row" data-smx-go="${h(p.id)}"><span class="smx-page-icon">${SMX.icon(p.icon || 'arrowRight')}</span><span class="smx-page-copy"><span class="smx-page-name">${h(typeof p.nav === 'function' ? p.nav(ctx) : p.nav)}</span><span class="smx-page-blurb">${h(typeof blurb === 'function' ? blurb(ctx) : blurb)}</span></span><span class="smx-page-end">${st ? ui.status(st.text, st.tone) : ''}<span class="smx-thing-go">${SMX.icon('go')}</span></span></button>`;
    }).join('')}</div></section>`;
  };

  /* PMConcept7's rows keep their ids, values and controls; their words can be replaced as a row is drawn, so one
     choice reads the same way wherever it appears. SMX.reword({'setting.id': {label, help, action, unit}})
     (written by the Backups builder; it lives here so every chapter, search and the moved list share it) */
  SMX.words = SMX.words || {};
  SMX.reword = (map) => {
    // merged per setting: a chapter rewords a row's label, the words pass adds its choices, and neither loses the other's
    for (const [id, w] of Object.entries(map || {})) SMX.words[id] = Object.assign({}, SMX.words[id], w, w.options ? { options: Object.assign({}, (SMX.words[id] || {}).options, w.options) } : {});
    if (SMX.wordsOn) return; SMX.wordsOn = true;
    const text = (row, sel, to) => { const n = row.querySelector(sel); if (!n) return; const t = [...n.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim()); if (t) { if (t.nodeValue !== to) t.nodeValue = to; } else if (!n.firstChild) n.textContent = to; };
    /* a dropdown's choices: {options: {'old words': 'new words'}} renames a choice in the list and on the closed
       dropdown (the value that is saved stays PMConcept7's own) */
    const choices = (row, map) => { const sel = row.querySelector('select'); if (!sel) return; for (const o of sel.options) { const to = map[o.textContent.trim()] || map[o.value]; if (to && o.textContent !== to) o.textContent = to; } const v = row.querySelector('.pm51-dd-value'), cur = sel.options[sel.selectedIndex]; if (v && cur && v.textContent !== cur.textContent) v.textContent = cur.textContent; };
    /* The row's control is named, for a screen reader, by the label that shows. PMConcept7 named it by its inventory
       label ("Offline (Air-Gap) Mode" under a row that reads "Work offline"; review R2-4) until stream F's landing of
       2026-11-11 named it by the row's own label. A row reworded here still needs this: its shown label is ours. */
    const name = (row) => {
      const lab = row.querySelector('.setting-label'); if (!lab) return;
      const t = [...lab.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim()); const text = t ? t.nodeValue.trim() : '';
      if (!text) return;
      const cs = [...row.querySelectorAll('.setting-control [role="switch"], .setting-control .toggle, .setting-control .pm51-dd-trigger, .setting-control input:not([type="hidden"]):not([type="file"]), .setting-control textarea')];
      if (cs.length === 1 && cs[0].getAttribute('aria-label') !== text) cs[0].setAttribute('aria-label', text);
      // the row's "About" button too (it said "About Monthly token budget" beside "Monthly limit on tokens"; review R2 by GLM, F2)
      const ab = row.querySelector('[data-action="setting-details"]');
      if (ab) { const want = 'About ' + text; if (ab.getAttribute('aria-label') !== want) ab.setAttribute('aria-label', want); if (ab.hasAttribute('data-pm-hover-label') && ab.getAttribute('data-pm-hover-label') !== want) ab.setAttribute('data-pm-hover-label', want); }
    };
    /* words inside a control (a list's own summary, "3 services"): {replace: [[/pattern/g, 'words'], …]} */
    const inside = (row, pairs) => { const c = row.querySelector('.setting-control'); if (!c) return; const w = W.document.createTreeWalker(c, W.NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { let v = n.nodeValue; for (const [re, to] of pairs) v = v.replace(re, to); if (v !== n.nodeValue) n.nodeValue = v; } };
    const fix = (row) => { const w = SMX.words[String(row.id || '').slice(8)]; if (!w) { name(row); return; } if (w.options) choices(row, w.options); if (w.replace) inside(row, w.replace); if (w.label) text(row, '.setting-label', w.label); if (w.help) text(row, '.setting-description', w.help); if (w.action) { const b = row.querySelector('.setting-control .btn span, .setting-control .o55-textbtn'); const to = b ? (typeof w.action === 'function' ? w.action(b.textContent) : w.action) : ''; if (b && to && b.textContent !== to) b.textContent = to; }
      // the control's accessible name follows the reworded label (a switch under "Work offline" still said "Offline (Air-Gap) Mode" to a screen reader; review R2-4)
      name(row); if (w.unit) { const u = row.querySelector('.o55-unit'); if (u && u.textContent !== w.unit) u.textContent = w.unit; } };
    const ROW = '.setting-row[id^="setting-"]';
    const scan = (n) => { if (!n || n.nodeType !== 1) return; if (n.matches(ROW)) fix(n); n.querySelectorAll(ROW).forEach(fix); };
    const start = () => { const host = SMX.host && SMX.host(); if (!host) { W.setTimeout(start, 300); return; } new W.MutationObserver((list) => { for (const m of list) { const el = m.target && m.target.nodeType === 1 ? m.target : m.target && m.target.parentElement; const row = el && el.closest ? el.closest(ROW) : null; if (row) fix(row); for (const n of m.addedNodes) scan(n); } }).observe(host, { childList: true, subtree: true, characterData: true }); scan(host); };
    start();
  };
  /* the words a setting goes by in the redesign: its reworded label, else PMConcept7's row label. listLabel names a
     setting in lists and panels only, for a row that each page labels itself ("Use Claude"): it never rewrites a row */
  SMX.labelOf = (id) => { const w = SMX.words[id]; if (w && (w.label || w.listLabel)) return w.label || w.listLabel; try { const s = kit().setting(id); return (s && (kit().rowLabel(s) || s.label)) || id; } catch (e) { return id; } };

  /* a page that is planned but whose manager-drawn parts are not rebuilt in this cut */
  /* a page that is in the plan but not built yet says so in plain words, whatever it draws (bare: it draws no rows) */
  ui.pending = (p, bare) => `<section class="panel-card pm51-section smx-pending"><div class="pm51-section-head"><div class="pm51-section-copy"><h3 class="pm51-section-title">This page is not redesigned yet</h3><p class="pm51-section-help">${bare ? 'Its settings, lists and guided steps open in the page as it is today, with one press.' : 'Its settings are below, in their new place. Its lists and guided steps still open in the page as it is today, with one press.'} The other chapters show where this one is going.</p></div><div class="pm51-section-actions">${ui.btn({ label: 'Open it as it is today', icon: 'external', do: 'see-today' })}</div></div></section>`;

  /* a line of text that reads as a sentence and holds real controls */
  ui.sentence = (html, o = {}) => `<div class="smx-sentence${o.cls ? ' ' + o.cls : ''}">${html}</div>`;
  ui.kicker = (text) => `<h3 class="smx-kicker">${h(text)}</h3>`;

  /* ------------------------------------------------------------------ search: pages, settings and things, by everyday words */
  const SYN = {
    password: ['sign-in', 'sign in', 'key', 'token'], login: ['sign-in', 'sign in', 'account'], signin: ['sign-in', 'sign in'],
    phone: ['device', 'paired', 'pair a', 'away from home', 'notification'], mobile: ['device', 'paired', 'pair a'], tablet: ['device', 'paired', 'pair a'], ipad: ['device', 'paired'],
    remote: ['away from home', 'tailscale', 'vpn', 'remote link'], anywhere: ['away from home'], outside: ['away from home'], vpn: ['away from home', 'tailscale'],
    dark: ['light or dark', 'theme'], color: ['theme', 'accent', 'colors'], colour: ['theme', 'accent', 'colors'],
    font: ['text size', 'font'], bigger: ['text size', 'size of everything'], zoom: ['size of everything'],
    ai: ['ai provider', 'model'], provider: ['ai provider'], claude: ['ai provider'], chatgpt: ['ai provider'], gpt: ['ai provider'], openai: ['ai provider'],
    cost: ['spending', 'budget', 'limits'], money: ['spending', 'budget'], bill: ['spending', 'billed'], price: ['spending'],
    server: ['computer', 'server'], nas: ['computer', 'server'], machine: ['computer'], pc: ['computer'], laptop: ['computer', 'device'],
    backup: ['backup', 'restore'], save: ['backup', 'autosave'], undo: ['restore', 'history'], delete: ['cleanup', 'keep'],
    git: ['source control', 'version history'], github: ['source control', 'code service'], sound: ['sound', 'bell'], mute: ['sound', 'quiet hours'],
    alert: ['notification'], notify: ['notification'], permission: ['allow', 'asking', 'approval'], safe: ['protect', 'filesafe', 'approval'],
    shortcut: ['keyboard', 'shortcuts'], hotkey: ['keyboard', 'shortcuts'], broken: ['checkup', 'doctor'], problem: ['checkup', 'doctor'], fix: ['checkup']
  };
  const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const WORD = new Map();
  const word = (w) => { let r = WORD.get(w); if (!r) { r = new RegExp('(^|[^a-z0-9])' + esc(w)); WORD.set(w, r); } return r; };
  const WHOLE = new Map();   // an everyday word stands for whole words only: “key” is not “keyboard”
  const whole = (w) => { let r = WHOLE.get(w); if (!r) { r = new RegExp('(^|[^a-z0-9])' + esc(w) + '(s|es)?($|[^a-z0-9])'); WHOLE.set(w, r); } return r; };
  let INDEX = null;
  function buildIndex() {
    const idx = [];
    const ctx = { st: SMX.st(), local: SMX.local };
    const chTitle = (id) => { const c = SMX.chapters.find((x) => x.id === id); return c ? c.title : ''; };
    for (const p of SMX.pages) {
      if (p.id.includes(':')) continue;
      const title = typeof p.title === 'function' ? p.title(ctx) : p.title;
      const nav = typeof p.nav === 'function' ? p.nav(ctx) : (p.nav || title);
      idx.push({ kind: 'page', title: p.id === p.chapter ? title : nav, sub: p.id === p.chapter || p.id === 'home' ? (typeof p.purpose === 'function' ? p.purpose(ctx) : (p.purpose || '')) : `${chTitle(p.chapter)}`, route: p.id, text: [title, nav, typeof p.purpose === 'string' ? p.purpose : '', (p.keywords || []).join(' ')].join(' ').toLowerCase(), aka: (p.keywords || []).concat(p.aka || []).map((k) => String(k).toLowerCase()), weight: 3 });
    }
    const place = SMX.placement();
    for (const [id, rec] of place.claimed) {
      const s = kit().setting(id); if (!s) continue;
      let label = s.label, help = s.description || '';
      try { label = kit().rowLabel(s) || label; help = kit().rowHelp(s) || help; } catch (e) { /* inventory words */ }
      const was = label;                                                                          // what PMConcept7 calls the row: still found by that name
      const w = SMX.words[id]; if (w) { if (w.label) label = w.label; if (w.help) help = w.help; }   // the redesign's own words for this row
      const aka = [was, s.label].concat(w && w.options ? Object.keys(w.options).concat(Object.values(w.options)) : []).filter((x) => x && x !== label).map((x) => String(x).toLowerCase());
      const m = SMX.match(rec.route); const pg = m ? m.page : null;
      const pTitle = pg ? (typeof pg.nav === 'function' ? pg.nav(ctx) : (pg.nav || (typeof pg.title === 'function' ? pg.title(ctx) : pg.title))) : '';
      idx.push({ kind: 'setting', title: label, sub: `${pg ? chTitle(pg.chapter) : ''}${pTitle && pg && pg.id !== pg.chapter ? ' › ' + pTitle : ''}${rec.section ? ' › ' + rec.section : ''}`, route: rec.route, reveal: id, text: [label, s.label, was, help, id.replace(/[.\-]/g, ' ')].join(' ').toLowerCase(), aka, weight: rec.level === 'main' || rec.level === 'drawn' ? 2 : 1 });
    }
    for (const f of (SMX.thingSources || [])) { try { for (const t of f(ctx.st)) idx.push(Object.assign({ kind: 'thing', weight: 3, text: [t.title, t.sub || ''].concat(t.aka || []).join(' ').toLowerCase() }, t, { aka: (t.aka || []).map((k) => String(k).toLowerCase()) })); } catch (e) { /* skip a source that fails */ } }
    INDEX = idx; return idx;
  }
  function find(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
    const idx = INDEX || buildIndex();
    const out = [];
    for (const it of idx) {
      let score = 0, ok = true;
      const title = it.title.toLowerCase();
      for (const w of words) {
        let s = 0;
        if (title === w) s = 12; else if (title.startsWith(w)) s = 9; else if (word(w).test(title)) s = 7; else if (title.includes(w)) s = 5;
        // "also called": a page's keywords, PMConcept7's own name for a reworded row. "crawl" finds "Read a whole site"
        // before a page that merely has the letters in its name; "service try order" still finds the row.
        if (s < 8 && it.aka && it.aka.length) { const k = it.aka.some((x) => x === w) ? 8 : it.aka.some((x) => x.startsWith(w)) ? 6 : it.aka.some((x) => word(w).test(x)) ? 4.5 : 0; if (k > s) s = k; }
        if (!s) { if (word(w).test(it.text)) s = 2; else if (w.length > 3 && it.text.includes(w)) s = 1; }
        if (!s && SYN[w]) for (const alt of SYN[w]) { if (whole(alt).test(title)) { s = 4; break; } if (whole(alt).test(it.text)) s = Math.max(s, 1.5); }
        if (!s) { ok = false; break; }
        score += s;
      }
      if (ok) out.push([score * it.weight, it]);
    }
    out.sort((a, b) => b[0] - a[0]);
    return out.slice(0, 40).map((x) => x[1]);
  }
  let sel = 0, results = [];
  SMX.search = {
    find,
    reset() { INDEX = null; },
    show(q) {
      if (!q || !q.trim()) { SMX.closeLayer(); return; }
      results = find(q); sel = 0;
      const group = (kind, title) => { const list = results.filter((r) => r.kind === kind).slice(0, kind === 'setting' ? 12 : 6); if (!list.length) return ''; return `<div class="smx-find-group">${h(title)}</div>${list.map((r) => `<button type="button" class="smx-find-row" data-smx-go="${h(r.route)}"${r.reveal ? ` data-smx-reveal="${h(r.reveal)}"` : ''} data-smx-find="${results.indexOf(r)}"><span class="smx-find-title">${h(r.title)}</span><span class="smx-find-sub">${h(r.sub || '')}</span></button>`).join('')}`; };
      const body = results.length ? group('page', 'Pages') + group('thing', 'Your things') + group('setting', 'Settings') : `<div class="smx-find-none">Nothing matches “${h(q)}”. Try an everyday word, like “phone”, “dark” or “spending”.</div>`;
      SMX.openLayer('find', `<div class="smx-find" role="listbox" aria-label="Search results">${body}</div>`, 'smx-layer-find');
      // the results hang just under the search box, wherever the layout has put it (the stylesheet's top is a fallback)
      try { const L = SMX.layer(), box = SMX.host().querySelector('.smx-search'), panel = L && L.querySelector('.smx-find'); if (box && panel) panel.style.top = Math.round(box.getBoundingClientRect().bottom - L.getBoundingClientRect().top + 6) + 'px'; } catch (e) { /* the stylesheet's place stands */ }
      this.mark();
    },
    mark() { const L = SMX.layer(); if (!L) return; L.querySelectorAll('.smx-find-row').forEach((b, i) => b.classList.toggle('is-sel', i === sel)); },
    key(e) {
      const L = SMX.layer(); const rows = L ? [...L.querySelectorAll('.smx-find-row')] : [];
      if (!rows.length) return;
      if (e.key === 'ArrowDown') { sel = Math.min(rows.length - 1, sel + 1); this.mark(); rows[sel].scrollIntoView({ block: 'nearest' }); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); this.mark(); rows[sel].scrollIntoView({ block: 'nearest' }); e.preventDefault(); }
      else if (e.key === 'Enter') { rows[sel].click(); SMX.query = ''; e.preventDefault(); }
    }
  };

  /* ------------------------------------------------------------------ review panels (for the person judging the concept; not part of the design) */
  const OLD = {
    domains: { general: 'General', ai: 'AI & Providers', code: 'Code & Tools', memory: 'Memory & Automation', planning: 'Planning', source: 'Source Control', projects: 'Projects & Sync', safety: 'Safety & Permissions', system: 'System' },
    ws: { 'app-input': 'App & Input', notifications: 'Notifications & Sounds', providers: 'Providers & Accounts', web: 'Web & Research', media: 'Media & Output', bsd: 'Back Seat Driver', 'editor-runtime': 'Editor & Terminal', toolchain: 'Toolchain', skills: 'Skills', plugins: 'Plugins', mcp: 'MCP Servers', commands: 'Commands & Shortcuts', testing: 'Testing & Debug', 'code-reference': 'Containers', 'context-memory': 'Context & Memory', goals: 'Goals & Automation', personas: 'Personas & Crews', 'planning-reference': 'Planning & Interviews', 'source-manager': 'Source Control', 'browser-scm': 'Browser & SCM', 'project-settings': 'All Project Settings', 'project-history': 'History & Artifacts', permissions: 'Permissions & Safety', 'settings-transfer': 'Settings Transfer', servers: 'Server & Project Location', backup: 'Backup & Restore', doctor: 'Readiness & Doctor', updates: 'App Updates', advanced: 'Advanced Settings' }
  };
  SMX.oldNames = OLD;
  const pageName = (route) => { const m = SMX.match(route); if (!m) return route; const p = m.page; const c = SMX.chapters.find((x) => x.id === p.chapter); const ctx = { st: SMX.st(), local: SMX.local }; const nav = typeof p.nav === 'function' ? p.nav(ctx) : (p.nav || (typeof p.title === 'function' ? p.title(ctx) : p.title)); return p.id === p.chapter ? (c ? c.title : nav) : `${c ? c.title : ''} › ${nav}`; };
  SMX.pageName = pageName;
  SMX.movedList = () => {
    const place = SMX.placement(); const rows = [];
    for (const [id, rec] of place.claimed) {
      const old = SMX.oldHome(id); if (!old) continue;
      const s = kit().setting(id); let label = s ? s.label : id; try { label = kit().rowLabel(s) || label; } catch (e) { /* keep */ }
      const oldName = `${OLD.ws[old.workspace] || old.workspace}${old.tab ? ' › ' + old.tab : ''}`;
      const m = SMX.match(rec.route); const lg = m && m.page.legacy ? m.page.legacy : [];
      const samePage = lg.some((l) => l[1] === old.workspace && (!l[2] || !old.tab || l[2] === old.tab));
      const oldLevel = old.advanced ? 'folded' : 'shown'; const newLevel = rec.level === 'more' || rec.level === 'expert' ? 'folded' : 'shown';
      rows.push({ id, label, oldWs: old.workspace, oldName, oldSection: old.section, oldLevel, route: rec.route, newName: pageName(rec.route), newSection: rec.section, level: rec.level, moved: !samePage, refolded: oldLevel !== newLevel });
    }
    return rows;
  };
  SMX.showChanges = () => {
    if (SMX.layerOpen === 'changes') { SMX.closeLayer(); return; }
    const m = SMX.match(SMX.route); if (!m) return;
    const p = m.page; const ctx = { st: SMX.st(), local: SMX.local, params: m.params };
    const list = typeof p.changes === 'function' ? p.changes(ctx) : (p.changes || []);
    const title = typeof p.title === 'function' ? p.title(ctx) : p.title;
    const moved = SMX.movedList().filter((r) => r.route === p.id && r.moved);
    const body = (list.length ? `<ol class="smx-rv-list">${list.map((c) => `<li>${typeof c === 'string' ? `<div class="smx-rv-now">${c}</div>` : `<div class="smx-rv-was"><b>Today</b> ${c.was}</div><div class="smx-rv-now"><b>Here</b> ${c.now}</div>`}</li>`).join('')}</ol>` : '<p class="smx-rv-none">This page keeps what PMConcept7 has, in the new page shape.</p>')
      + (moved.length ? `<h4 class="smx-rv-sub">Settings that came here from somewhere else (${moved.length})</h4><ul class="smx-rv-moved">${moved.slice(0, 80).map((r) => `<li><span>${h(r.label)}</span><small>from ${h(r.oldName)}${r.oldSection ? ' › ' + h(r.oldSection) : ''}</small></li>`).join('')}</ul>` : '');
    SMX.openLayer('changes', `<aside class="smx-rv" aria-label="What changed on this page"><header><div><div class="smx-rv-eyebrow">Review notes · not part of the design</div><h3>What changed on “${h(title)}”</h3></div><button type="button" class="btn small pm51-btn" data-smx-do="close-layer">Close</button></header><div class="smx-rv-body">${body}</div></aside>`, 'smx-layer-rv');
  };
  SMX.showMoved = () => {
    if (SMX.layerOpen === 'moved') { SMX.closeLayer(); return; }
    const rows = SMX.movedList(); const cov = SMX.coverage();
    const moved = rows.filter((r) => r.moved);
    const byOld = {};
    for (const r of moved) (byOld[r.oldName] = byOld[r.oldName] || []).push(r);
    const groups = Object.keys(byOld).sort().map((k) => `<details class="smx-rv-group"><summary><span>${h(k)}</span><small>${byOld[k].length} moved</small></summary><table class="smx-rv-table"><tbody>${byOld[k].map((r) => `<tr><td>${h(r.label)}<small>${h(r.id)}</small></td><td>${h(r.oldSection || '')}</td><td><button type="button" class="pm51-link" data-smx-go="${h(r.route)}" data-smx-reveal="${h(r.id)}">${h(r.newName)}</button>${r.newSection ? `<small>${h(r.newSection)}${r.level === 'more' ? ' · More options' : r.level === 'expert' ? ' · For experts' : ''}</small>` : ''}</td></tr>`).join('')}</tbody></table></details>`).join('');
    const refold = rows.filter((r) => !r.moved && r.refolded).length;
    const head = `<p class="smx-rv-totals"><b>${cov.total}</b> settings in PMConcept7. <b>${cov.placed}</b> have a place in the redesign${cov.missing.length ? `, <em>${cov.missing.length} still have none</em>` : ', none are missing'}${cov.twice.length ? `, <em>${cov.twice.length} are drawn twice</em>` : ''}. <b>${moved.length}</b> moved to a different page; <b>${refold}</b> stayed on their page but changed between shown and folded away.</p>`;
    const miss = cov.missing.length ? `<details class="smx-rv-group" open><summary><span>Not placed yet</span><small>${cov.missing.length}</small></summary><ul class="smx-rv-moved">${cov.missing.map((id) => `<li><span>${h(id)}</span></li>`).join('')}</ul></details>` : '';
    SMX.openLayer('moved', `<aside class="smx-rv smx-rv-wide" aria-label="Everything that moved"><header><div><div class="smx-rv-eyebrow">Review notes · not part of the design</div><h3>Everything that moved</h3></div><button type="button" class="btn small pm51-btn" data-smx-do="close-layer">Close</button></header><div class="smx-rv-body">${head}${miss}${groups}</div></aside>`, 'smx-layer-rv');
  };
  SMX.act('close-layer', () => SMX.closeLayer());
  SMX.act('toggle', (el) => { const k = el.getAttribute('data-flag'); SMX.local.flags[k] = !SMX.local.flags[k]; });
})(window);
