/* O55.c — HTML components for screens. Every interactive element uses aria-disabled (never `disabled`: the shell's
   hover-tag layer swallows clicks on anything once rendered disabled) and is exempt from hover tags. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, esc = U.esc;
  /* The window's interface icons are the neon set's (pm7-glyphs D44; rollout ONBOARDING round 2). ART maps each art
     glyph a screen names to its neon glyph (the catalog's before-and-after map, table T-art); the art scenes still draw
     A.glyphs in each family's material (card GLY-4). Every name falls back to its art drawing when PMG cannot draw it.
     smallArt is the old drawing, kept for the tour's Planning Wizard mock, which must keep matching the wizard (the
     wizard gets no adoption). 13 px asks were 13 only for the art strokes' sake; the set draws them at 14. */
  const ART = {
    seed: 'sprout', folder: 'folder', computer: 'monitor', person: 'user', cloud: 'cloud', vault: 'vault',
    server: 'server', box: 'archive', rewind: 'history', key: 'key', globe: 'globe', spark: 'sparkles', link: 'link',
    power: 'lightning', history: 'history', phone: 'phone', check: 'check', lock: 'lock', plug: 'plug', stack: 'layers'
  };
  const px = (s) => (s === 13 ? 14 : s || 16);
  const glyphArt = (g) => `<svg viewBox="0 0 24 24" width="22" height="22">${O55.art.glyph(g || 'spark', 'currentColor', 1.9)}</svg>`;
  const glyph = (g) => `<span class="o55-glyph" aria-hidden="true">${U.nx(ART[g || 'spark'], 22, 'concept') || glyphArt(g)}</span>`;
  const smallArt = (g, s) => `<svg class="o55-sg" viewBox="0 0 24 24" width="${s || 16}" height="${s || 16}" aria-hidden="true">${O55.art.glyph(g || 'spark', 'currentColor', 2.1)}</svg>`;
  const small = (g, s) => U.nx(ART[g || 'spark'], px(s), 'concept', 'o55-sg') || smallArt(g, s);
  /* A status of the shared vocabulary, beside its words: done is the drawn check, a warning the triangle, working the
     bead on its ring (the only mark that moves). `old` is what the window drew before, for a page without PMG. */
  const mark = (status, s, old) => U.mark(status, px(s), 'o55-sg o55-mk', status === 'working') || (old != null ? old : '');
  const spinOld = '<span class="o55-spin" aria-hidden="true"></span>';
  const spin = (s) => mark('working', s || 12, spinOld);
  /* A wait (scanning a network, checking this computer, a sign-in in the browser, protect's working line) is the system
     loader (L1, L6: PM_PIP_LOADER, Pip's swing; NieR's Diamond loaders under NieR Mode); an item's state in a row keeps
     the working mark (spin above). */
  /* (kept whole through the window's morph, so a refresh never restarts it; 60-ui-core.js arms it with PM_PIP_LOADER.mount) */
  const loader = (s) => { const P = window.PM_PIP_LOADER; try { if (P && typeof P.html === 'function') return `<span class="o55-ldwrap" data-morph-skip>${P.html({ motion: 'swing', px: s || 16, className: 'o55-loader' })}</span>`; } catch (_) {} return spin(s); };
  const done = (s) => mark('complete', s, smallArt('check', s));
  const X = { 'data-pm-hover-exempt': 'true' };
  const PHASE = { waiting: 'pending', active: 'working', done: 'complete', failed: 'failed' };
  const NOTE = { warn: 'warning', ok: 'complete', info: 'info' };
  const phmark = (status, old) => {
    const m = mark(status, 14, null);
    return m ? `<span class="o55-phmark o55-phmark-nx" aria-hidden="true">${m}</span>` : `<span class="o55-phmark" aria-hidden="true">${old}</span>`;
  };
  /* A step of a list you walk (the backup's steps): done is the done mark, the step you are on is the set's position
     marker (the ring with a dot, the rail's "current"), a later step is pending. */
  const stepmark = (state, old) => {
    const m = state === 'done' ? mark('complete', 14, null) : state === 'active' ? U.nx('ring-dot', 14, 'concept', 'o55-mk') : mark('pending', 14, null);
    return m ? `<span class="o55-phmark o55-phmark-nx" aria-hidden="true">${m}</span>` : `<span class="o55-phmark" aria-hidden="true">${old}</span>`;
  };
  /* the details disclosure's "?" is the set's help glyph (the help circle beside every Settings field) */
  const help = () => { const g = U.nx('help', 18, 'control'); return g ? `<span class="o55-q o55-q-nx" aria-hidden="true">${g}</span>` : '<span class="o55-q" aria-hidden="true">?</span>'; };

  /* ---------------------------------------------------------------- Ask Pip: the ? beside every choice (DL-238, O7)
     Every choice, field and option has a ? at its right edge (a look tile in its corner, a field beside its label, a
     segmented control after it). Pressing it is ui.onboarding.open_details with toggle_choice_explanation: Pip previews
     that choice and writes its answer in the one anchored explainer, #pm7ob-explainer, which the ? controls and the
     choice is described by. One at a time; the ? again, Esc, the note's close button or moving on puts it away and
     focus returns to the ?. Nothing shows unless asked, and nothing opens on hover.
     The words are the copy lane's (copy.d/48-pip.json): pip.tips.<screen>[id], then pip.tips.common, then
     pip.tips.chrome. A control's id is <data-o55-do>:<data-arg>, or <data-o55-do> alone, or field:<bind>; a bind with a
     suffix of its own (key:cursor) falls back to field:key, and an option with no tip of its own to its group's
     (group:<data-o55-do>). On a wide window the stage draws the explainer as Pip's note in the look's own material
     (O55.pipStage); where the stage is only a strip, or not drawn, the explainer opens in the form under its choice. */
  const tipMap = (k) => { const m = O55.tx('pip.tips.' + k); return m && typeof m === 'object' ? m : null; };
  function tipOf(id, screen) {
    if (!id) return null;
    const scr = screen || (O55.S && O55.S.sess && O55.S.sess.screen) || '';
    const maps = [tipMap(scr), tipMap('common'), tipMap('chrome')].filter(Boolean);
    const p = String(id).split(':'), tries = [String(id)];
    if (p[0] === 'field' && p.length > 2) tries.push('field:' + p[1]);
    if (p.length > 1 && p[0] !== 'field' && p[0] !== 'group') tries.push(p[0], 'group:' + p[0]);
    for (const k of tries) for (const m of maps) { const v = m[k]; if (v && v.title && v.text) return { id: String(id), key: k, title: v.title, text: v.text }; }
    return null;
  }
  const tipOpen = (id) => !!(O55.S && O55.S.tip && O55.S.tip.id === id && O55.S.tip.screen === (O55.S.sess && O55.S.sess.screen));
  /* the note is drawn on Pip's stage when the stage can hold it (a wide window with the stage up); otherwise in the form */
  const onStage = () => !!(O55.pipStage && O55.pipStage.holdsTip && O55.pipStage.holdsTip());
  const described = (id) => (tipOpen(id) ? ' aria-describedby="pm7ob-explainer"' : '');
  function q(id, o) {
    const t = tipOf(id); if (!t) return '';
    o = o || {};
    const open = tipOpen(id);
    return `<button type="button" class="o55-tipq${o.cls ? ' ' + o.cls : ''}${open ? ' o55-on' : ''}" data-o55-do="tip" data-arg="${esc(id)}" data-o55-sound="self" aria-expanded="${open}"${open ? ' aria-controls="pm7ob-explainer"' : ''}`
      + ` aria-label="${esc(O55.t('pip.stage.q.label', { name: t.title }))}" title="${esc(O55.t('pip.stage.q.title'))}" data-pm-hover-exempt="true" data-key="q-${esc(id)}"><span aria-hidden="true">?</span></button>`;
  }
  /* The explainer in the form, right after the choice it explains (never on the stage's behalf: when the stage holds it,
     this is empty). Its words are written out at Pip's pace (aria-hidden), with the whole text for assistive tech. */
  function explainer(id) {
    if (!tipOpen(id) || onStage()) return '';
    const t = tipOf(id); if (!t) return '';
    const mark = O55.pip && O55.pip.mark ? O55.pip.mark(26) : '';
    return `<div class="o55-explainer" id="pm7ob-explainer" role="note" aria-label="${esc(t.title)}" data-key="explainer-${esc(id)}" data-tip="${esc(id)}">`
      + (mark ? `<span class="o55-explainer-pip" aria-hidden="true">${mark}</span>` : '')
      + `<span class="o55-explainer-t"><b class="o55-explainer-h">${esc(t.title)}</b><span class="o55-explainer-w" aria-hidden="true" data-morph-skip></span><span class="o55-sr">${esc(t.text)}</span></span>`
      + `<button type="button" class="o55-iconbtn o55-explainer-x" data-o55-do="tip" data-arg="${esc(id)}" data-o55-sound="self" aria-label="${esc(O55.t('pip.stage.note.close'))}" data-pm-hover-exempt="true">`
      + `${U.nx('close', 14, 'control') || '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'}</button></div>`;
  }
  /* a control with its ?: the control and the ? side by side in one option (the ? is never inside the control) */
  /* (o.note false: the caller draws the explainer itself, after the block the control sits in) */
  /* (while its note is open the control is described by it: the control's own tag gets the note's id, beside any
     description it already has) */
  const describe = (id, html) => (!tipOpen(id) ? html : String(html).replace(/^(\s*<[a-z]+\b)([^>]*)>/i, (m, a, at) => (/\saria-describedby="/.test(at)
    ? a + at.replace(/\saria-describedby="([^"]*)"/, (x, v) => (v.split(' ').includes('pm7ob-explainer') ? x : ` aria-describedby="${v} pm7ob-explainer"`)) : a + at + ' aria-describedby="pm7ob-explainer"') + '>'));
  const opt = (id, control, cls, tag, o) => {
    const qh = q(id); if (!qh) return control;
    tag = tag || 'div';
    return `<${tag} class="o55-opt${cls ? ' ' + cls : ''}" data-key="opt-${esc(id)}">${describe(id, control)}${qh}</${tag}>${o && o.note === false ? '' : explainer(id)}`;
  };
  /* a control that names its own tip only (a link, a button): an arg-free tip of its action counts, a group's does not */
  const exact = (action, arg) => { const id = arg != null && arg !== '' ? action + ':' + arg : action, t = tipOf(id); return t && (t.key === id || t.key === action) ? id : null; };
  /* The note's words are written out at the pace Pip writes them (its stage's own: Retro's terminal 60 letters a second,
     NieR 55, the others 44), into a line that already has the whole text's size, so nothing below it moves. Written once
     per opening; Reduced Motion shows the words at once. */
  let writing = null;
  function write(scope) {
    const w = scope && scope.querySelector('#pm7ob-explainer .o55-explainer-w'), host = w && w.closest('[data-tip]');
    if (!w || !host) return;
    const id = host.getAttribute('data-tip'), t = tipOf(id);
    if (!t || w.getAttribute('data-written') === id) return;
    w.setAttribute('data-written', id);
    if (writing) { writing.cancel(); writing = null; }
    if (O55.motion.reduced()) { w.textContent = t.text; return; }
    const th = O55.theme(), cps = th.nier ? 55 : th.family === 'retro' ? 60 : 44;
    w.innerHTML = '<span class="o55-tw-on"></span><span class="o55-tw-off"></span>';
    const on = w.firstChild, off = w.lastChild;
    off.textContent = t.text; host.classList.add('o55-writing');
    /* (on the stage's typer: it holds while the window is dragged, hidden or closed, and goes on where it was) */
    const job = writing = O55.pipStage.h.typer(t.text.length, cps, (n) => { on.textContent = t.text.slice(0, n); off.textContent = t.text.slice(n); }, {
      paused: () => { if (!w.isConnected) { job.cancel(); if (writing === job) writing = null; return true; } return !(O55.S && O55.S.open); },
      done: () => { host.classList.remove('o55-writing'); if (writing === job) writing = null; }
    });
  }
  O55.tips = { of: tipOf, open: tipOpen, q, explainer, opt, exact, described, describe, onStage, write };

  const C = O55.c = {
    glyph, small, smallArt, mark, spin, loader, done, stepmark,
    /* Choice cards (radio semantics). options: [{v, title, sub, glyph, tag, disabled, reason, key, under}]; each with its ? */
    cards(action, options, selected, o) {
      o = o || {};
      return `<div class="o55-choices${o.cls ? ' ' + o.cls : ''}" role="radiogroup"${o.label ? ` aria-label="${esc(o.label)}"` : ''}>`
        + options.filter(Boolean).map((opt1) => {
          /* {sep}: a line of words between two kinds of choice in one list (a Recovery Kit file, then the places) */
          if (opt1.sep) return `<p class="o55-choicesep" data-key="sep-${esc(opt1.key || 'sep')}">${esc(opt1.sep)}</p>`;
          const on = opt1.v === selected, id = action + ':' + opt1.v;
          const dis = opt1.disabled ? ` aria-disabled="true" data-disabled-reason="${esc(opt1.reason || '')}"` : '';
          return opt(id, `<button type="button" class="o55-card${on ? ' o55-on' : ''}${opt1.quiet ? ' o55-card-quiet' : ''}${opt1.under ? ' o55-card-parent' : ''}" role="radio" aria-checked="${on}" data-o55-do="${esc(action)}" data-arg="${esc(opt1.v)}"${dis}${described(id)}${U.attrs(X)} data-key="card-${esc(opt1.key || opt1.v)}">`
            + (opt1.glyph ? glyph(opt1.glyph) : '') + `<span class="o55-cardtext"><span class="o55-cardtitle">${esc(opt1.title)}</span>`
            + (opt1.sub ? `<span class="o55-cardsub">${esc(opt1.sub)}</span>` : '') + `</span>`
            + (opt1.tag ? `<span class="o55-tag">${esc(opt1.tag)}</span>` : '') + `<span class="o55-check" aria-hidden="true"></span></button>`, on ? 'o55-opt-on' : '', null, opt1.under ? { note: false } : null)
            /* opt1.under: what this choice asks next (which device, which folder, which service), directly under it and
               part of it, never below the whole list (Jared, QA round 2, Q7); the choice's own note, when it opens in the
               form, is the tray's first line, so it never parts the card from its tray */
            + (opt1.under ? `<div class="o55-under" role="group" aria-label="${esc(opt1.title)}" data-key="under-${esc(opt1.key || opt1.v)}">${explainer(id)}${opt1.under}</div>` : '');
        }).join('') + '</div>';
    },
    /* A row with state and exactly one action. */
    /* r.tip: the row's own ? (an AI account, a Free Models route), at its right edge */
    row(r) {
      const act = r.action ? O55.ui.btn(Object.assign({ cls: 'o55-small', tip: false }, r.action), r.action.kind === 'primary' ? 'o55-primary' : 'o55-secondary') : '';
      /* (a row is not itself a control, so its ? sits inside it, in a column of its own at the right edge) */
      const qh = r.tip ? q(r.tip) : '';
      return `<div class="o55-row${r.cls ? ' ' + r.cls : ''}${qh ? ' o55-row-q' : ''}" data-key="row-${esc(r.key || r.title)}"${qh ? described(r.tip) : ''}>` + (r.glyph ? glyph(r.glyph) : r.lead || '')
        + `<span class="o55-rowtext"><span class="o55-rowtitle">${esc(r.title)}</span>` + (r.meta ? `<span class="o55-rowmeta">${esc(r.meta)}</span>` : '') + '</span>'
        + (r.state ? C.pill(r.state[0], r.state[1]) : '') + act + qh + '</div>' + (qh ? explainer(r.tip) : '');
    },
    pill(kind, label) { return `<span class="o55-pill o55-pill-${esc(kind)}">${kind === 'ready' ? done(12) : kind === 'wait' ? spin(12) : ''}${esc(label)}</span>`; },
    /* a field's ? sits beside its label (field:<bind>; f.tip names another, false for none) */
    field(f) {
      const id = f.id || 'o55f-' + f.bind;
      const type = f.type || 'text', tid = f.tip === false ? null : f.tip || 'field:' + f.bind, qh = tid ? q(tid) : '';
      const input = type === 'textarea'
        ? `<textarea id="${id}" data-o55-bind="${esc(f.bind)}" rows="${f.rows || 3}" placeholder="${esc(f.placeholder || '')}"${qh ? described(tid) : ''}${U.attrs(X)}>${esc(f.value || '')}</textarea>`
        : `<input id="${id}" type="${type}" data-o55-bind="${esc(f.bind)}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}" autocomplete="${f.autocomplete || 'off'}" spellcheck="false"${f.protected ? ' data-o55-protected="true"' : ''}${f.invalid ? ' aria-invalid="true"' : ''}${qh ? described(tid) : ''}${U.attrs(X)}>`;
      const label = qh ? `<span class="o55-labq"><label for="${id}">${esc(f.label)}</label>${qh}</span>` : `<label for="${id}">${esc(f.label)}</label>`;
      return `<div class="o55-field${f.invalid ? ' o55-invalid' : ''}${f.cls ? ' ' + f.cls : ''}" data-key="field-${esc(f.bind)}">${label}${f.prefix ? `<div class="o55-inputwrap"><span class="o55-prefix">${esc(f.prefix)}</span>${input}</div>` : input}`
        /* f.reserve: the hint's line is always there (empty until there is something to say), so a hint appearing as the
           person types never pushes what follows the field down under their eyes */
        + (f.hint || f.error ? `<span class="o55-hint${f.error ? ' o55-err' : ''}" aria-live="polite">${f.valid ? done(12) : ''}${esc(f.error || f.hint)}</span>` : f.reserve ? '<span class="o55-hint" aria-live="polite"></span>' : '') + '</div>'
        + (qh ? explainer(tid) : '');
    },
    toggle(t) {
      const id = t.arg != null ? t.do + ':' + t.arg : t.do;
      return opt(id, `<button type="button" class="o55-toggle${t.on ? ' o55-on' : ''}" role="switch" aria-checked="${!!t.on}" data-o55-do="${esc(t.do)}"${t.arg != null ? ` data-arg="${esc(t.arg)}"` : ''}${described(id)}${U.attrs(X)} data-key="tg-${esc(t.do)}-${esc(t.arg || '')}">`
        + `<span class="o55-switch" aria-hidden="true"><span></span></span><span class="o55-toggletext"><span class="o55-toggletitle">${esc(t.label)}</span>${t.sub ? `<span class="o55-togglesub">${esc(t.sub)}</span>` : ''}</span></button>`, 'o55-opt-toggle' + (t.on ? ' o55-opt-on' : ''));
    },
    /* one ? after the segments, for the chosen segment (<do>:<arg>, falling back to the group's group:<do>); an open note
       follows the choice when another segment is chosen */
    segmented(s) {
      const id = s.do + ':' + s.value, St = O55.S;
      if (St && St.tip && St.tip.seg === s.do && St.tip.screen === (St.sess && St.sess.screen) && St.tip.id !== id) St.tip.id = id;
      const seg = `<div class="o55-seg" role="radiogroup"${s.label ? ` aria-label="${esc(s.label)}"` : ''}${described(id)} data-key="seg-${esc(s.do)}">` + s.options.map((o) =>
        `<button type="button" role="radio" aria-checked="${o.v === s.value}" class="${o.v === s.value ? 'o55-on' : ''}" data-o55-do="${esc(s.do)}" data-arg="${esc(o.v)}"${o.disabled ? ` aria-disabled="true" data-disabled-reason="${esc(o.reason || '')}"` : ''}${U.attrs(X)}>${o.glyph ? small(o.glyph, 14) : ''}<span>${esc(o.label)}</span></button>`).join('') + '</div>';
      const qh = q(id);
      return qh ? `<span class="o55-opt o55-opt-seg" data-key="opt-seg-${esc(s.do)}" data-o55-seg="${esc(s.do)}">${seg}${qh}</span>${explainer(id)}` : seg;
    },
    /* Inline "?" disclosure (ui.onboarding.open_details); same-stage, ephemeral. */
    details(S, key, label, body) {
      const open = !!S.sess.ui['details:' + key];
      return `<div class="o55-details${open ? ' o55-open' : ''}" data-key="det-${esc(key)}"><button type="button" class="o55-detbtn" data-o55-do="details" data-arg="${esc(key)}" aria-expanded="${open}"${U.attrs(X)}>`
        + `${help()}<span>${esc(label)}</span></button>` + (open ? `<div class="o55-detbody">${body}</div>` : '') + '</div>';
    },
    /* A phase's mark is the shared mark on its own (GLY-3: one drawing per state everywhere); the disc it sat on goes
       (o55-phmark-nx, 25-glyphs.css), so the tone carries what the fill did. */
    phases(list) {
      return `<ol class="o55-phases">` + list.map((p) => `<li class="o55-ph o55-ph-${esc(p.status)}" data-key="ph-${esc(p.key)}">${phmark(PHASE[p.status] || 'pending', p.status === 'done' ? small('check', 13) : p.status === 'failed' ? '!' : '')}<span class="o55-phlabel">${esc(p.label)}</span>${p.detail ? `<span class="o55-phdetail">${esc(p.detail)}</span>` : ''}</li>`).join('') + '</ol>';
    },
    /* A note that names no glyph shows its kind's mark (warn: the triangle; ok: done; info: the ringed i). */
    note(text, kind, g) { return `<p class="o55-note o55-note-${esc(kind || 'info')}">${g ? small(g, 14) : mark(NOTE[kind] || 'info', 14, smallArt(kind === 'warn' ? 'spark' : 'check', 14))}<span>${esc(text)}</span></p>`; },
    identity(seed, words, caption) {
      const fam = O55.theme().family;
      return `<div class="o55-identity-chip" data-key="id-${esc(seed)}">${O55.art.identitySvg(seed, 46, fam)}<span><span class="o55-idwords">${esc(words)}</span>${caption ? `<span class="o55-idcap">${esc(caption)}</span>` : ''}</span></div>`;
    },
    group(title, content, o) { return `<section class="o55-group${o && o.cls ? ' ' + o.cls : ''}" data-key="grp-${esc(title)}">${title ? `<h2 class="o55-grouptitle">${esc(title)}</h2>` : ''}${content}</section>`; },
    /* a link with a tip of its own gets its ? beside it (o: { tip: false } for none) */
    link(label, action, arg, o) {
      const id = o && o.tip === false ? null : o && o.tip ? (tipOf(o.tip) ? o.tip : null) : exact(action, arg);
      /* (a link of a group whose one ? is drawn elsewhere, review's Edits, a path's crumbs: described by its note too) */
      const by = id || (tipOpen('group:' + action) ? 'group:' + action : null);
      const html = `<button type="button" class="o55-link" data-o55-do="${esc(action)}"${arg != null ? ` data-arg="${esc(arg)}"` : ''}${by ? described(by) : ''}${U.attrs(X)}>${esc(label)}</button>`;
      return id ? opt(id, html, 'o55-opt-inline', 'span') : html;
    },
    /* Interior sheet: replaces part of the window's interior (never a nested dialog). */
    sheet(S, key, title, body, foot) {
      if (S.sess.ui.sheet !== key) return '';
      return `<div class="o55-sheet" data-open="true" data-key="sheet-${esc(key)}" role="group" aria-label="${esc(title)}"><div class="o55-sheethead"><h2>${esc(title)}</h2>`
        + `<button type="button" class="o55-iconbtn" data-o55-do="sheet-close" aria-label="${esc(O55.t('chrome.done'))}"${U.attrs(X)}>${U.nx('close', 16, 'control') || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'}</button></div>`
        + `<div class="o55-sheetbody">${body}</div>${foot ? `<div class="o55-sheetfoot">${foot}</div>` : ''}</div>`;
    },
    kv(rows) { return `<dl class="o55-kv">${rows.filter(Boolean).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`; }
  };
})();
