/* O55.c — HTML components for screens. Every interactive element uses aria-disabled (never `disabled`: the shell's
   hover-tag layer swallows clicks on anything once rendered disabled) and is exempt from hover tags. */
(function () {
  'use strict';
  const O55 = window.O55, U = O55.util, esc = U.esc;
  const glyph = (g) => `<span class="o55-glyph" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22">${O55.art.glyph(g || 'spark', 'currentColor', 1.9)}</svg></span>`;
  const small = (g, s) => `<svg class="o55-sg" viewBox="0 0 24 24" width="${s || 16}" height="${s || 16}" aria-hidden="true">${O55.art.glyph(g || 'spark', 'currentColor', 2.1)}</svg>`;
  const X = { 'data-pm-hover-exempt': 'true' };

  const C = O55.c = {
    glyph, small,
    /* Choice cards (radio semantics). options: [{v, title, sub, glyph, tag, disabled, reason, key}] */
    cards(action, options, selected, o) {
      o = o || {};
      return `<div class="o55-choices${o.cls ? ' ' + o.cls : ''}" role="radiogroup"${o.label ? ` aria-label="${esc(o.label)}"` : ''}>`
        + options.filter(Boolean).map((opt) => {
          const on = opt.v === selected;
          const dis = opt.disabled ? ` aria-disabled="true" data-disabled-reason="${esc(opt.reason || '')}"` : '';
          return `<button type="button" class="o55-card${on ? ' o55-on' : ''}${opt.quiet ? ' o55-card-quiet' : ''}" role="radio" aria-checked="${on}" data-o55-do="${esc(action)}" data-arg="${esc(opt.v)}"${dis}${U.attrs(X)} data-key="card-${esc(opt.key || opt.v)}">`
            + (opt.glyph ? glyph(opt.glyph) : '') + `<span class="o55-cardtext"><span class="o55-cardtitle">${esc(opt.title)}</span>`
            + (opt.sub ? `<span class="o55-cardsub">${esc(opt.sub)}</span>` : '') + `</span>`
            + (opt.tag ? `<span class="o55-tag">${esc(opt.tag)}</span>` : '') + `<span class="o55-check" aria-hidden="true"></span></button>`;
        }).join('') + '</div>';
    },
    /* A row with state and exactly one action. */
    row(r) {
      const act = r.action ? O55.ui.btn(Object.assign({ cls: 'o55-small' }, r.action), r.action.kind === 'primary' ? 'o55-primary' : 'o55-secondary') : '';
      return `<div class="o55-row${r.cls ? ' ' + r.cls : ''}" data-key="row-${esc(r.key || r.title)}">` + (r.glyph ? glyph(r.glyph) : r.lead || '')
        + `<span class="o55-rowtext"><span class="o55-rowtitle">${esc(r.title)}</span>` + (r.meta ? `<span class="o55-rowmeta">${esc(r.meta)}</span>` : '') + '</span>'
        + (r.state ? C.pill(r.state[0], r.state[1]) : '') + act + '</div>';
    },
    pill(kind, label) { return `<span class="o55-pill o55-pill-${esc(kind)}">${kind === 'ready' ? small('check', 12) : kind === 'wait' ? '<span class="o55-spin" aria-hidden="true"></span>' : ''}${esc(label)}</span>`; },
    field(f) {
      const id = f.id || 'o55f-' + f.bind;
      const type = f.type || 'text';
      const input = type === 'textarea'
        ? `<textarea id="${id}" data-o55-bind="${esc(f.bind)}" rows="${f.rows || 3}" placeholder="${esc(f.placeholder || '')}"${U.attrs(X)}>${esc(f.value || '')}</textarea>`
        : `<input id="${id}" type="${type}" data-o55-bind="${esc(f.bind)}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}" autocomplete="${f.autocomplete || 'off'}" spellcheck="false"${f.protected ? ' data-o55-protected="true"' : ''}${f.invalid ? ' aria-invalid="true"' : ''}${U.attrs(X)}>`;
      return `<div class="o55-field${f.invalid ? ' o55-invalid' : ''}${f.cls ? ' ' + f.cls : ''}" data-key="field-${esc(f.bind)}"><label for="${id}">${esc(f.label)}</label>${f.prefix ? `<div class="o55-inputwrap"><span class="o55-prefix">${esc(f.prefix)}</span>${input}</div>` : input}`
        + (f.hint || f.error ? `<span class="o55-hint${f.error ? ' o55-err' : ''}" aria-live="polite">${f.valid ? small('check', 12) : ''}${esc(f.error || f.hint)}</span>` : '') + '</div>';
    },
    toggle(t) {
      return `<button type="button" class="o55-toggle${t.on ? ' o55-on' : ''}" role="switch" aria-checked="${!!t.on}" data-o55-do="${esc(t.do)}"${t.arg != null ? ` data-arg="${esc(t.arg)}"` : ''}${U.attrs(X)} data-key="tg-${esc(t.do)}-${esc(t.arg || '')}">`
        + `<span class="o55-switch" aria-hidden="true"><span></span></span><span class="o55-toggletext"><span class="o55-toggletitle">${esc(t.label)}</span>${t.sub ? `<span class="o55-togglesub">${esc(t.sub)}</span>` : ''}</span></button>`;
    },
    segmented(s) {
      return `<div class="o55-seg" role="radiogroup"${s.label ? ` aria-label="${esc(s.label)}"` : ''} data-key="seg-${esc(s.do)}">` + s.options.map((o) =>
        `<button type="button" role="radio" aria-checked="${o.v === s.value}" class="${o.v === s.value ? 'o55-on' : ''}" data-o55-do="${esc(s.do)}" data-arg="${esc(o.v)}"${o.disabled ? ` aria-disabled="true" data-disabled-reason="${esc(o.reason || '')}"` : ''}${U.attrs(X)}>${o.glyph ? small(o.glyph, 14) : ''}<span>${esc(o.label)}</span></button>`).join('') + '</div>';
    },
    /* Inline "?" disclosure (ui.onboarding.open_details); same-stage, ephemeral. */
    details(S, key, label, body) {
      const open = !!S.sess.ui['details:' + key];
      return `<div class="o55-details${open ? ' o55-open' : ''}" data-key="det-${esc(key)}"><button type="button" class="o55-detbtn" data-o55-do="details" data-arg="${esc(key)}" aria-expanded="${open}"${U.attrs(X)}>`
        + `<span class="o55-q" aria-hidden="true">?</span><span>${esc(label)}</span></button>` + (open ? `<div class="o55-detbody">${body}</div>` : '') + '</div>';
    },
    phases(list) {
      return `<ol class="o55-phases">` + list.map((p) => `<li class="o55-ph o55-ph-${esc(p.status)}" data-key="ph-${esc(p.key)}"><span class="o55-phmark" aria-hidden="true">${p.status === 'done' ? small('check', 13) : p.status === 'failed' ? '!' : ''}</span><span class="o55-phlabel">${esc(p.label)}</span>${p.detail ? `<span class="o55-phdetail">${esc(p.detail)}</span>` : ''}</li>`).join('') + '</ol>';
    },
    note(text, kind, g) { return `<p class="o55-note o55-note-${esc(kind || 'info')}">${small(g || (kind === 'warn' ? 'spark' : 'check'), 14)}<span>${esc(text)}</span></p>`; },
    identity(seed, words, caption) {
      const fam = O55.theme().family;
      return `<div class="o55-identity-chip" data-key="id-${esc(seed)}">${O55.art.identitySvg(seed, 46, fam)}<span><span class="o55-idwords">${esc(words)}</span>${caption ? `<span class="o55-idcap">${esc(caption)}</span>` : ''}</span></div>`;
    },
    group(title, content, o) { return `<section class="o55-group${o && o.cls ? ' ' + o.cls : ''}" data-key="grp-${esc(title)}">${title ? `<h2 class="o55-grouptitle">${esc(title)}</h2>` : ''}${content}</section>`; },
    link(label, action, arg) { return `<button type="button" class="o55-link" data-o55-do="${esc(action)}"${arg != null ? ` data-arg="${esc(arg)}"` : ''}${U.attrs(X)}>${esc(label)}</button>`; },
    /* Interior sheet: replaces part of the window's interior (never a nested dialog). */
    sheet(S, key, title, body, foot) {
      if (S.sess.ui.sheet !== key) return '';
      return `<div class="o55-sheet" data-open="true" data-key="sheet-${esc(key)}" role="group" aria-label="${esc(title)}"><div class="o55-sheethead"><h2>${esc(title)}</h2>`
        + `<button type="button" class="o55-iconbtn" data-o55-do="sheet-close" aria-label="${esc(O55.t('chrome.done'))}"${U.attrs(X)}><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`
        + `<div class="o55-sheetbody">${body}</div>${foot ? `<div class="o55-sheetfoot">${foot}</div>` : ''}</div>`;
    },
    kv(rows) { return `<dl class="o55-kv">${rows.filter(Boolean).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`; }
  };
})();
