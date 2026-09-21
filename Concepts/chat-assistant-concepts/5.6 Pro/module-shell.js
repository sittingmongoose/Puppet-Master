/* module-shell — shared dialog grammar for the wand-menu modules.
   Pure string builders: no state, no actions, no dependency on app internals.
   Contract: every argument is trusted, pre-escaped HTML (callers use their own
   esc()); values bound into attributes are escaped here via esc(). Icons
   arrive pre-rendered (ctx.icon(name,size)) so each module keeps owning icon
   choice. Loaded before every consumer module (see build.py MODULES). */
(function () {
  'use strict';
  if (window.PM56_SHELL) return;

  var CLOSE_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var CHEVRON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* dialog({iconHtml,title,sub,pill,width,ariaLabel,body,foot,closeAction,closeIcon}) */
  function dialog(o) {
    o = o || {};
    return '<section class="dialog mdl' + (o.cls ? ' ' + o.cls : '') + '" style="width:min(' + (o.width || 640) + 'px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="' + esc(o.ariaLabel || o.title) + '">' +
        '<div class="mdl-head">' +
          '<span class="mdl-icon">' + (o.iconHtml || '') + '</span>' +
          '<div class="mdl-title"><strong>' + (o.title || '') + '</strong>' + (o.sub ? '<span>' + o.sub + '</span>' : '') + '</div>' +
          (o.pill ? '<span class="meta-pill">' + o.pill + '</span>' : '') +
          '<span class="spacer"></span>' +
          '<button type="button" class="icon-button" data-action="' + esc(o.closeAction || 'close-dialog') + '" aria-label="Close dialog">' + (o.closeIcon || CLOSE_ICON) + '</button>' +
        '</div>' +
        '<div class="mdl-body">' + (o.body || '') + '</div>' +
        (o.foot ? '<footer class="mdl-foot">' + o.foot + '</footer>' : '') +
      '</section>';
  }

  /* section({iconHtml,label,meta,body}) */
  function section(o) {
    o = o || {};
    return '<section class="mdl-section">' +
        '<div class="mdl-section-head">' + (o.iconHtml || '') +
          '<span class="mdl-section-label">' + (o.label || '') + '</span>' +
          (o.meta ? '<span class="mdl-section-meta">' + o.meta + '</span>' : '') +
        '</div>' +
        '<div class="mdl-section-body">' + (o.body || '') + '</div>' +
      '</section>';
  }

  /* field(labelHtml, controlHtml, hintHtml?) — exactly one interactive control. */
  function field(labelHtml, controlHtml, hintHtml) {
    return '<label class="mdl-field"><span>' + labelHtml + '</span>' + (controlHtml || '') +
      (hintHtml ? '<small class="mdl-note">' + hintHtml + '</small>' : '') + '</label>';
  }

  function grid2(bodyHtml) { return '<div class="mdl-grid2">' + (bodyHtml || '') + '</div>'; }

  /* seg(options,current,action,extraAttrsFn?) — options: [[value,label],…] or {value,label}. */
  function seg(options, current, action, extraAttrsFn) {
    return '<div class="mdl-seg" role="group">' + (options || []).map(function (opt) {
      var value = Array.isArray(opt) ? opt[0] : opt.value;
      var label = Array.isArray(opt) ? opt[1] : opt.label;
      var active = String(value) === String(current);
      return '<button type="button" class="' + (active ? 'active' : '') + '" data-action="' + esc(action) + '" data-value="' + esc(String(value)) + '" aria-pressed="' + active + '"' + (extraAttrsFn ? (extraAttrsFn(value, label) || '') : '') + '>' + label + '</button>';
    }).join('') + '</div>';
  }

  /* tabs(items,current,{action,attr}) — same option shape as seg; attr defaults to data-value. */
  function tabs(items, current, o) {
    o = o || {};
    var attr = o.attr || 'data-value';
    return '<div class="mdl-tabs" role="tablist">' + (items || []).map(function (it) {
      var value = Array.isArray(it) ? it[0] : it.value;
      var label = Array.isArray(it) ? it[1] : it.label;
      var active = String(value) === String(current);
      return '<button type="button" role="tab" aria-selected="' + active + '" class="' + (active ? 'active' : '') + '" data-action="' + esc(o.action) + '" ' + attr + '="' + esc(String(value)) + '">' + label + '</button>';
    }).join('') + '</div>';
  }

  /* disclosure(key,summaryHtml,bodyHtml,open?,cls?) — cls appends legacy classes. */
  function disclosure(key, summaryHtml, bodyHtml, open, cls) {
    return '<details class="mdl-disclosure' + (cls ? ' ' + cls : '') + '" data-k="' + esc(key) + '"' + (open ? ' open' : '') + '>' +
        '<summary>' + summaryHtml + CHEVRON + '</summary>' +
        '<div class="mdl-disclosure-body">' + (bodyHtml || '') + '</div>' +
      '</details>';
  }

  /* choice({value,label,detail,active,action,extra}) — data-value is String(value) verbatim. */
  function choice(o) {
    o = o || {};
    var active = !!o.active;
    return '<button type="button" class="mdl-choice' + (active ? ' active' : '') + '" role="radio" aria-checked="' + active + '" data-action="' + esc(o.action) + '" data-value="' + esc(String(o.value)) + '"' + (o.extra || '') + '>' +
        '<span class="mdl-radio" aria-hidden="true"></span>' +
        '<span><strong>' + (o.label || '') + '</strong>' + (o.detail ? '<small>' + o.detail + '</small>' : '') + '</span>' +
      '</button>';
  }

  function chip(tone, labelHtml) {
    return '<span class="mdl-chip"' + (tone ? ' data-tone="' + esc(tone) + '"' : '') + '>' + labelHtml + '</span>';
  }

  /* rows([[keyHtml,valueHtml],…]) */
  function rows(pairs) {
    return '<div class="mdl-rows">' + (pairs || []).map(function (p) {
      return '<div><span>' + p[0] + '</span><strong>' + p[1] + '</strong></div>';
    }).join('') + '</div>';
  }

  function note(html, tone) {
    return '<p class="mdl-note' + (tone ? ' ' + esc(tone) : '') + '">' + html + '</p>';
  }


  function stat(labelHtml, valueHtml) {
    return '<div class="mdl-stat"><strong>' + valueHtml + '</strong><span>' + labelHtml + '</span></div>';
  }

  /* stats([[label,valueHtml],…]) */
  function stats(items) {
    return '<div class="mdl-stats">' + (items || []).map(function (it) { return stat(it[0], it[1]); }).join('') + '</div>';
  }

  function foot(leftHtml, rightHtml) {
    return (leftHtml || '') + '<span class="spacer"></span>' + (rightHtml || '');
  }

  /* card({attrs,head,body,actions}) + cardHead/copy helpers for list rows. */
  function card(o) {
    o = o || {};
    return '<article class="mdl-card"' + (o.attrs || '') + '>' +
      (o.head ? '<div class="mdl-card-head">' + o.head + '</div>' : '') +
      (o.body || '') +
      (o.actions ? '<div class="mdl-card-actions">' + o.actions + '</div>' : '') +
      '</article>';
  }

  function cardHead(o) {
    o = o || {};
    return (o.iconHtml ? '<span class="mdl-card-icon">' + o.iconHtml + '</span>' : '') +
      (o.copy ? '<span class="mdl-card-copy">' + o.copy + '</span>' : '') +
      (o.extra || '');
  }

  function copy(strongHtml, spanHtml) {
    return '<strong>' + strongHtml + '</strong>' + (spanHtml ? '<span>' + spanHtml + '</span>' : '');
  }

  function check(labelHtml, checked, attrs) {
    return '<label class="mdl-check"><input type="checkbox"' + (checked ? ' checked' : '') + (attrs || '') + '><span>' + labelHtml + '</span></label>';
  }

  /* pickerButton({action,anchor,strong,small,markHtml,iconHtml,extra}) —
     markup-compatible with PM56_PICKERS.modelButton and bsd.js choices(). */
  function pickerButton(o) {
    o = o || {};
    return '<button type="button" class="shared-picker-button" data-action="' + esc(o.action) + '" data-menu-anchor="' + esc(o.anchor) + '"' + (o.extra ? ' ' + o.extra : '') + '>' +
      (o.markHtml || '') +
      '<span class="shared-picker-copy"><strong>' + (o.strong || '') + '</strong>' + (o.small ? '<small>' + o.small + '</small>' : '') + '</span>' +
      (o.iconHtml || CHEVRON) +
    '</button>';
  }

  window.PM56_SHELL = {
    esc: esc,
    dialog: dialog, section: section, field: field, grid2: grid2,
    seg: seg, tabs: tabs, choice: choice, chip: chip, rows: rows, note: note,
    disclosure: disclosure, stat: stat, stats: stats, foot: foot,
    card: card, cardHead: cardHead, copy: copy, check: check,
    pickerButton: pickerButton,
    CHEVRON: CHEVRON
  };
})();
