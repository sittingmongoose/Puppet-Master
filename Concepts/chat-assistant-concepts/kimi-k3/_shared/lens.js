/* ============================================================================
   Kimi K3 — Context Lens kit (window.K3Lens).

   Canonical semantics live in data.js (selection cap, apply, turn-off); the
   thread kit owns message-click selection. This kit supplies the two chrome
   pieces every window reuses:

   - K3Lens.button(ctx) -> element
       Header button (icon 'lens', .is-on while the ACTIVE thread has any
       applied shaping). Click opens a K3UI.menu: shaping summary header,
       Mute / Focus / Subcompact (each enters selection mode), separator,
       Turn Off (exits selection AND clears all shaping). While selection is
       active the first item is "Exit selection". The returned element also
       carries an .unmount() method that drops its subscriptions.

   - K3Lens.mountBanner(hostEl, ctx) -> {unmount}
       Slim selection-mode bar windows place above the transcript slot.
       Visible only while lens[activeThread].selecting. Mute/Focus apply
       immediately via the thread kit (text + Done). Subcompact collects up
       to 25 messages, then Apply (label carries the count, disabled at 0);
       a {error:'limit'} answer shows the inline "25 messages per operation"
       note. Done exits selection (setSelecting false + clear selectedIds).

   Freshness: both pieces subscribe ctx 'data' events, the store 'lens'
   prefix, and store 'activeThreadId' — shaping is thread-local, so chrome
   always reflects the active thread. css prefix k3l-. No emoji.
   ========================================================================== */
(function () {
  'use strict';

  const SELECT_CAP = 25; // mirrors LENS_SELECT_CAP in data.js

  function icon(name) { return window.K3Icons.get(name); }
  function activeThreadId(ctx) { return ctx.store.get('activeThreadId', null); }

  function countsOf(lens) {
    const a = (lens && lens.applied) || {};
    return {
      muted: (a.muted || []).length,
      focused: (a.focused || []).length,
      subcompacted: (a.subcompacted || []).length
    };
  }

  // "2 muted · 1 focused" / "No shaping" / "Lens is off"
  function shapingText(lens) {
    if (lens && lens.mode === 'off') return 'Lens is off';
    const c = countsOf(lens);
    const parts = [];
    if (c.muted) parts.push(c.muted + ' muted');
    if (c.focused) parts.push(c.focused + ' focused');
    if (c.subcompacted) parts.push(c.subcompacted + ' subcompacted');
    return parts.length ? parts.join(' · ') : 'No shaping';
  }

  function hasShaping(lens) {
    if (!lens || lens.mode === 'off') return false;
    const c = countsOf(lens);
    return c.muted + c.focused + c.subcompacted > 0;
  }

  function enterSelection(ctx, threadId, mode) {
    ctx.data.setSelecting(threadId, true);
    ctx.store.set('lens.' + threadId + '.mode', mode);
  }

  function exitSelection(ctx, threadId) {
    ctx.data.setSelecting(threadId, false);
    ctx.store.set('lens.' + threadId + '.selectedIds', []);
  }

  // Subscribes the given refresh fn to the three freshness channels and
  // returns the matching unsubscribe-all.
  function subscribeFresh(ctx, refresh) {
    function onData(evt) { if (!evt || evt.type === 'lens-changed') refresh(); }
    ctx.on('data', onData);
    const unsubLens = ctx.store.subscribe('lens', refresh);
    const unsubActive = ctx.store.subscribe('activeThreadId', refresh);
    return function () {
      ctx.off('data', onData);
      unsubLens();
      unsubActive();
    };
  }

  const K3Lens = {
    button(ctx) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'k3-icon-btn k3l-button';
      btn.setAttribute('data-testid', 'k3-lens-button');
      btn.setAttribute('aria-label', 'Context Lens');
      btn.title = 'Context Lens';
      btn.appendChild(icon('lens'));

      function threadId() { return activeThreadId(ctx); }
      function lens() {
        const t = threadId();
        return t ? ctx.data.lensState(t) : null;
      }

      function refresh() {
        const on = hasShaping(lens());
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      }

      btn.addEventListener('click', () => {
        const t = threadId();
        if (!t) return;
        const l = ctx.data.lensState(t);
        const items = [];
        if (l.selecting) {
          items.push({
            label: 'Exit selection',
            icon: 'check',
            action: () => exitSelection(ctx, t)
          });
        }
        items.push({ type: 'header', label: shapingText(l) });
        [
          { mode: 'mute', label: 'Mute', icon: 'lens-mute' },
          { mode: 'focus', label: 'Focus', icon: 'lens-focus' },
          { mode: 'subcompact', label: 'Subcompact', icon: 'lens-subcompact' }
        ].forEach((entry) => {
          items.push({
            label: entry.label,
            icon: entry.icon,
            action: () => enterSelection(ctx, t, entry.mode)
          });
        });
        items.push({ type: 'separator' });
        items.push({
          label: 'Turn Off',
          icon: 'close',
          action: () => ctx.data.turnOffLens(t)
        });
        ctx.ui.menu(btn, items);
      });

      const unsubscribe = subscribeFresh(ctx, refresh);
      refresh();

      btn.unmount = unsubscribe;
      return btn;
    },

    mountBanner(hostEl, ctx) {
      const bar = document.createElement('div');
      bar.className = 'k3l-banner';
      bar.setAttribute('data-testid', 'k3-lens-banner');
      bar.hidden = true;

      const ic = document.createElement('span');
      ic.className = 'k3l-banner-ic';
      ic.appendChild(icon('lens'));
      bar.appendChild(ic);

      const text = document.createElement('span');
      text.className = 'k3l-banner-text';
      bar.appendChild(text);

      const note = document.createElement('span');
      note.className = 'k3l-banner-note';
      note.hidden = true;
      bar.appendChild(note);

      const spacer = document.createElement('span');
      spacer.className = 'k3l-spacer';
      bar.appendChild(spacer);

      const applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'k3-btn k3l-apply';
      applyBtn.setAttribute('data-testid', 'k3-lens-apply');
      applyBtn.hidden = true;
      bar.appendChild(applyBtn);

      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'k3-btn k3-btn-ghost k3l-done';
      doneBtn.setAttribute('data-testid', 'k3-lens-done');
      doneBtn.textContent = 'Done';
      bar.appendChild(doneBtn);

      hostEl.appendChild(bar);

      function threadId() { return activeThreadId(ctx); }

      function refresh() {
        const t = threadId();
        const l = t ? ctx.data.lensState(t) : null;
        const selecting = !!(l && l.selecting);
        bar.hidden = !selecting;
        note.hidden = true; // the limit note is transient: any state change clears it
        if (!selecting) return;

        const mode = l.mode;
        const iconName = mode && window.K3Icons.has('lens-' + mode) ? 'lens-' + mode : 'lens';
        ic.innerHTML = '';
        ic.appendChild(icon(iconName));

        if (mode === 'subcompact') {
          const n = l.selectedIds.length;
          text.textContent = 'Select up to ' + SELECT_CAP + ' messages, then Apply';
          applyBtn.hidden = false;
          applyBtn.textContent = 'Apply Subcompact (' + n + ')';
          applyBtn.disabled = n === 0;
        } else if (mode === 'mute' || mode === 'focus') {
          text.textContent = 'Click messages to ' + mode + ' them — applies immediately';
          applyBtn.hidden = true;
        } else {
          text.textContent = 'Click messages to select them';
          applyBtn.hidden = true;
        }
      }

      applyBtn.addEventListener('click', () => {
        const t = threadId();
        if (!t) return;
        const res = ctx.data.applyLens(t, 'subcompact');
        if (res && res.error === 'limit') {
          note.textContent = SELECT_CAP + ' messages per operation';
          note.hidden = false;
        }
        // success: applyLens exits selection; the subscriptions re-render.
      });

      doneBtn.addEventListener('click', () => {
        const t = threadId();
        if (t) exitSelection(ctx, t);
      });

      const unsubscribe = subscribeFresh(ctx, refresh);
      refresh();

      return {
        unmount() {
          unsubscribe();
          if (bar.parentNode) bar.parentNode.removeChild(bar);
        }
      };
    }
  };

  window.K3Lens = K3Lens;
})();
