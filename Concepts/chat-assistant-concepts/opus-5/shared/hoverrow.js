/* PMX message hover row — Opus 5
 *
 * Structural contract (from the Tastebook thread in PMConcept7, and locked by the handoff):
 * the hover row is a SIBLING immediately BELOW the message body, not another nested container
 * inside the bubble.
 *
 *   <div class="pmx-msg">
 *     <div class="pmx-msg-body"> ... </div>
 *     <div class="pmx-msg-hover-row"> ... </div>     <-- sibling, not descendant
 *   </div>
 *
 * Assistant row, in this order: Copy, Provider, Model, Working/Worked for, More Info.
 * User row: Copy, Edit (only when eligible), Provider, Model, Working/Worked for, More Info.
 *
 * Removed on purpose, and asserted by tests:
 *   - Resend (editing and resubmitting replaces that workflow)
 *   - per-message Stop (Stop belongs to the composer)
 *   - exact clock timestamps (they live in More Info; the compact row shows duration only)
 *
 * The word "Agent" is not required in this row.
 * Copy may remain hover-only. This intentionally supersedes the older plan rule.
 */
(function (global) {
  'use strict';

  var U = null; /* resolved lazily so load order does not matter */
  function util() { return U || (U = global.PMXUtil); }

  /* Provider/Model/duration on a USER message describe the effective turn that message launched,
   * not the user's own authorship. data.js marks this with runtime.describesTurn === 'launched'. */
  function durationLabel(msg, isActive, fmt) {
    var rt = msg.runtime || {};
    var secs = rt.workedSeconds;
    if (secs == null) return null;
    return (isActive ? 'Working for ' : 'Worked for ') + fmt.duration(secs);
  }

  function metaSpan(text, cls) {
    return util().el('span', { class: ['pmx-msg-meta', cls || ''], text: text });
  }

  function sep() {
    return util().el('span', { class: 'pmx-msg-sep', aria: { hidden: 'true' }, text: '·' });
  }

  /* Copy always returns the COMPLETE message, even when the prose is visually collapsed.
   * Long-message collapse is a view concern and must never truncate what Copy yields. */
  function copyFull(msg, ctx) {
    var text = msg.body || '';
    var done = function () { ctx.services.toast.show('Message copied'); };
    try {
      if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    } catch (e) { fallbackCopy(text, done); }
  }

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch (e) { /* prototype: a failed copy is not worth an error dialog */ }
  }

  function iconBtn(ctx, iconName, label, onClick) {
    var b = util().el('button', {
      class: 'pmx-msg-btn',
      aria: { label: label },
      data: { pmxAction: iconName },
      on: { click: function (ev) { ev.stopPropagation(); onClick(ev); } }
    });
    b.title = label;
    b.appendChild(ctx.services.icons.get(iconName, 14));
    return b;
  }

  /* build(msg, opts) -> the hover row element.
   * opts: { isActive, onEdit, onMoreInfo }
   * The caller (a thread concept) appends this as a sibling of the body element. */
  function build(msg, ctx, opts) {
    opts = opts || {};
    var fmt = ctx.services ? ctx.data.fmt : global.PMXData.fmt;
    var rt = msg.runtime || {};
    var isUser = msg.role === 'user';
    var row = util().el('div', {
      class: 'pmx-msg-hover-row',
      data: { pmxRole: msg.role, pmxMsg: msg.id }
    });

    var actions = util().el('div', { class: 'pmx-msg-actions' });

    /* 1. Copy — always present, both roles. */
    actions.appendChild(iconBtn(ctx, 'copy', 'Copy', function () { copyFull(msg, ctx); }));

    /* 2. Edit — user messages only, and ONLY when eligible.
     * When the message cannot be edited safely the control is ABSENT, not disabled. */
    if (isUser && msg.eligibleForEdit) {
      actions.appendChild(iconBtn(ctx, 'edit', 'Edit', function (ev) {
        if (opts.onEdit) opts.onEdit(msg, ev);
      }));
    }

    row.appendChild(actions);

    /* Compact metadata: Provider, Model, duration. No exact clock time here. */
    var meta = util().el('div', { class: 'pmx-msg-runtime' });
    if (rt.provider) { meta.appendChild(metaSpan(rt.provider, 'pmx-msg-provider')); }
    if (rt.model) { meta.appendChild(sep()); meta.appendChild(metaSpan(rt.model, 'pmx-msg-model')); }
    var dur = durationLabel(msg, !!opts.isActive, fmt);
    if (dur) { meta.appendChild(sep()); meta.appendChild(metaSpan(dur, 'pmx-msg-dur')); }

    /* More Info — carries the exact time information. */
    var info = iconBtn(ctx, 'info', 'More Info', function (ev) {
      global.PMXMoreInfo.open(ev.currentTarget, msg, ctx);
      if (opts.onMoreInfo) opts.onMoreInfo(msg);
    });
    info.classList.add('pmx-msg-info');
    meta.appendChild(info);

    row.appendChild(meta);
    return row;
  }

  global.PMXHoverRow = { build: build, copyFull: copyFull };
})(window);
