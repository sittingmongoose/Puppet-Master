/* PANEL BAKEOFF — Puppet Master control kit
   =====================================================================
   Five components that replace every OS-native control in the panels.

     PM.select      replaces <select>                  -> Slint ComboBox / PopupWindow+ListView
     PM.menu        dropdown + overflow                -> Slint PopupWindow
     PM.ctx         right-click menu                   -> Slint PopupWindow at pointer (F3-242)
     PM.tip         tooltip (the app has none today)   -> PopupWindow + TouchArea.has-hover
     PM.confirm     replaces confirm()                 -> PopupWindow, no-auto-close + scrim
     PM.inputSheet  replaces prompt()                  -> ditto

   Declarative mounting: PM.mountAll(root) upgrades any markup carrying
   data-pm-select / data-pm-menu / data-pm-tip. Version authors write markup,
   never wiring.

   Keyboard models follow FinalGUISpec section 13.3 — every list supports
   Up/Down, Enter, Escape, Home/End and type-ahead.
   ===================================================================== */
(function (global) {
  'use strict';

  var PM = global.PM || (global.PM = {});
  var uid = 0;
  function nid(p) { return p + '-' + (++uid); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  var CARET = '<svg class="pm-select-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="6 9 12 15 18 9"/></svg>';
  var CHECK = '<svg class="pm-pop-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="20 6 9 17 4 12"/></svg>';
  var DOTS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="5" r="1.4"/>' +
    '<circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>';
  var SUBCARET = '<svg class="pm-ctx-sub-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

  var openPops = [];
  function closeAllPops(except) {
    openPops.slice().forEach(function (p) { if (p.el !== except) p.close(); });
  }

  /* ------------------------------------------------------------ item render
     One renderer for every popup body, so pm-select, pm-menu and pm-ctx are
     visually identical. Disabled items keep their reason line: required by
     GI-017, GAAAF-005 and CRAU-021. */
  function renderItems(host, items, opts) {
    opts = opts || {};
    host.innerHTML = '';
    items.forEach(function (it) {
      if (it.type === 'sep') { host.appendChild(el('div', 'pm-pop-sep')); return; }
      if (it.type === 'head') {
        var h = el('div', 'pm-pop-head');
        h.textContent = it.label;
        host.appendChild(h);
        return;
      }
      var b = el('button', 'pm-pop-item');
      b.type = 'button';
      b.setAttribute('role', opts.role || 'menuitem');
      b.dataset.value = it.value != null ? it.value : (it.id || '');
      if (it.danger) b.classList.add('is-danger');
      if (opts.selected != null && String(opts.selected) === String(it.value)) {
        b.classList.add('is-selected');
        if (opts.role === 'option') b.setAttribute('aria-selected', 'true');
      } else if (opts.role === 'option') {
        b.setAttribute('aria-selected', 'false');
      }
      if (it.disabled) {
        b.setAttribute('aria-disabled', 'true');
        /* focusable but inert — WAI-ARIA menu practice, so the user can
           reach it and learn why it is unavailable */
      }
      b.innerHTML =
        (opts.role === 'option' ? CHECK : (it.icon || '<span class="pm-pop-ico"></span>')) +
        '<span class="pm-pop-lbl">' + esc(it.label) + '</span>' +
        (it.hint ? '<span class="pm-pop-hint">' + esc(it.hint) + '</span>' : '');
      host.appendChild(b);

      if (it.disabled && (it.reason || it.sentence)) {
        var r = el('span', 'pm-pop-reason');
        r.innerHTML = (it.reason ? '<code>' + esc(it.reason) + '</code> ' : '') + esc(it.sentence || '');
        b.setAttribute('aria-describedby', (r.id = nid('pm-why')));
        host.appendChild(r);
      }
      if (it.submenu) b.insertAdjacentHTML('beforeend', SUBCARET);
      b.__pmItem = it;
    });
  }

  /* =============================== pm-select ============================= */
  var select = {};

  select.create = function (root, def) {
    if (root.__pmSelect) return root.__pmSelect;
    def = def || {};
    var options = def.options || readOptionTemplate(root);
    var value = def.value != null ? def.value : (root.dataset.value || (options[0] && options[0].value));
    var trigger = root.querySelector('.pm-select-trigger');
    if (!trigger) {
      trigger = el('button', 'pm-select-trigger');
      trigger.type = 'button';
      root.insertBefore(trigger, root.firstChild);
    }
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    var list = null, detach = null;

    function labelOf(v) {
      for (var i = 0; i < options.length; i++) if (String(options[i].value) === String(v)) return options[i].label;
      return v;
    }
    function paintTrigger() {
      trigger.innerHTML = '<span class="pm-select-label">' + esc(labelOf(value)) + '</span>' + CARET;
    }
    function open() {
      if (list) return;
      closeAllPops();
      list = el('div', 'pm-pop pm-select-list');
      list.setAttribute('role', 'listbox');
      if (def.label) list.setAttribute('aria-label', def.label);
      list.__pmAnchor = trigger;
      renderItems(list, options, { role: 'option', selected: value });
      PM.portal.mount(list, trigger);
      PM.portal.place(list, trigger, { prefer: 'below', matchWidth: false, minWidth: Math.max(180, trigger.offsetWidth) });
      PM.sprout.open(list, trigger);
      trigger.setAttribute('aria-expanded', 'true');

      var rov = PM.a11y.roving(list, '.pm-pop-item', { activeDescendant: trigger });
      var cur = list.querySelector('.pm-pop-item.is-selected') || list.querySelector('.pm-pop-item');
      rov.focus(cur);
      list.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var a = list.querySelector('.pm-pop-item.is-active');
          if (a) commit(a);
        }
      });
      list.addEventListener('click', function (e) {
        var b = e.target.closest('.pm-pop-item');
        if (b) commit(b);
      });
      list.tabIndex = -1;
      list.focus();
      detach = PM.portal.dismissOn(list, function () { close(true); });
      openPops.push({ el: list, close: function () { close(true); } });
    }
    function commit(btn) {
      if (btn.getAttribute('aria-disabled') === 'true') return;
      setValue(btn.dataset.value, true);
      close(true);
    }
    function close(refocus) {
      if (!list) return;
      var l = list; list = null;
      if (detach) { detach(); detach = null; }
      openPops = openPops.filter(function (p) { return p.el !== l; });
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      PM.sprout.close(l, function () { PM.portal.unmount(l); l.remove(); });
      if (refocus) trigger.focus();
    }
    function setValue(v, emit) {
      value = v;
      root.dataset.value = v;
      paintTrigger();
      if (emit) {
        root.dispatchEvent(new CustomEvent('pm:change', {
          bubbles: true, detail: { value: v, label: labelOf(v) }
        }));
        if (def.onChange) def.onChange(v, labelOf(v));
      }
    }

    trigger.addEventListener('click', function () { list ? close(true) : open(); });
    trigger.addEventListener('keydown', function (e) {
      if (list) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); open();
      } else if (e.key.length === 1) { open(); }
    });

    paintTrigger();
    var api = {
      el: root, open: open, close: close,
      value: function () { return value; },
      setValue: function (v) { setValue(v, false); },
      options: function () { return options.slice(); }
    };
    root.__pmSelect = api;
    return api;
  };

  function readOptionTemplate(root) {
    var t = root.querySelector('template[data-pm-options]');
    if (!t) return [];
    return Array.prototype.map.call(t.content.querySelectorAll('div'), function (d) {
      return {
        value: d.dataset.value,
        label: d.textContent.trim(),
        hint: d.dataset.hint || '',
        disabled: d.hasAttribute('data-disabled'),
        reason: d.dataset.reason || '',
        sentence: d.dataset.sentence || ''
      };
    });
  }

  select.value = function (r) { return r.__pmSelect && r.__pmSelect.value(); };
  select.setValue = function (r, v) { return r.__pmSelect && r.__pmSelect.setValue(v); };

  /* ================================ pm-menu ============================== */
  var menu = {};

  menu.create = function (root, def) {
    if (root.__pmMenu) return root.__pmMenu;
    def = def || {};
    var trigger = root.querySelector('.pm-menu-trigger') || root;
    var items = def.items || readMenuTemplate(root);
    var pop = null, detach = null;

    if (trigger.tagName === 'BUTTON' && !trigger.innerHTML.trim()) trigger.innerHTML = DOTS;
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    if (!trigger.getAttribute('data-pm-tip')) trigger.setAttribute('data-pm-tip', def.tip || 'More actions');

    function open() {
      if (pop) return;
      closeAllPops();
      pop = el('div', 'pm-pop pm-menu-panel');
      pop.setAttribute('role', 'menu');
      if (def.label) pop.setAttribute('aria-label', def.label);
      pop.__pmAnchor = trigger;
      renderItems(pop, typeof items === 'function' ? items() : items, { role: 'menuitem' });
      PM.portal.mount(pop, trigger);
      PM.portal.place(pop, trigger, { prefer: def.prefer || 'below' });
      PM.sprout.open(pop, trigger);
      trigger.setAttribute('aria-expanded', 'true');

      PM.a11y.roving(pop, '.pm-pop-item');
      var first = pop.querySelector('.pm-pop-item:not([aria-disabled="true"])');
      if (first) first.focus();
      pop.addEventListener('click', function (e) {
        var b = e.target.closest('.pm-pop-item');
        if (!b || b.getAttribute('aria-disabled') === 'true') return;
        var it = b.__pmItem || {};
        root.dispatchEvent(new CustomEvent('pm:menuaction', {
          bubbles: true, detail: { action: b.dataset.value, item: it }
        }));
        if (def.onAction) def.onAction(b.dataset.value, it);
        close(true);
      });
      detach = PM.portal.dismissOn(pop, function () { close(true); });
      openPops.push({ el: pop, close: function () { close(true); } });
    }
    function close(refocus) {
      if (!pop) return;
      var p = pop; pop = null;
      if (detach) { detach(); detach = null; }
      openPops = openPops.filter(function (x) { return x.el !== p; });
      trigger.setAttribute('aria-expanded', 'false');
      PM.sprout.close(p, function () { PM.portal.unmount(p); p.remove(); });
      if (refocus && trigger.focus) trigger.focus();
    }

    trigger.addEventListener('click', function (e) { e.stopPropagation(); pop ? close(true) : open(); });
    trigger.addEventListener('keydown', function (e) {
      if (!pop && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); }
    });

    var api = { el: root, open: open, close: close,
                setItems: function (i) { items = i; } };
    root.__pmMenu = api;
    return api;
  };

  function readMenuTemplate(root) {
    var t = root.querySelector('template[data-pm-items]');
    if (!t) return [];
    return Array.prototype.map.call(t.content.children, function (d) {
      if (d.dataset.sep != null || d.tagName === 'HR') return { type: 'sep' };
      if (d.dataset.head != null) return { type: 'head', label: d.textContent.trim() };
      return {
        value: d.dataset.value || d.dataset.action || '',
        label: d.textContent.trim(),
        hint: d.dataset.hint || '',
        danger: d.hasAttribute('data-danger'),
        disabled: d.hasAttribute('data-disabled'),
        reason: d.dataset.reason || '',
        sentence: d.dataset.sentence || ''
      };
    });
  }

  menu.closeAll = function () { closeAllPops(); };

  /* ============================ pm-context-menu ==========================
     Replaces .context-menu-mock. Adopts openTermCtxMenu's viewport-clamped
     body portal (PM7:18969) but the .pm6-tb-menu look, so the app ends up
     with ONE menu design instead of three. */
  var ctx = {};
  var ctxPop = null, ctxDetach = null, ctxResolve = null;

  ctx.open = function (x, y, def) {
    ctx.close();
    return new Promise(function (resolve) {
      ctxResolve = resolve;
      ctxPop = el('div', 'pm-pop pm-ctx');
      ctxPop.setAttribute('role', 'menu');
      if (def.label) ctxPop.setAttribute('aria-label', def.label);
      renderItems(ctxPop, def.items || [], { role: 'menuitem' });
      PM.portal.mount(ctxPop, def.from || document.body);
      PM.portal.place(ctxPop, { x: x, y: y }, { prefer: 'below', gap: 2 });
      PM.sprout.open(ctxPop, null);

      PM.a11y.roving(ctxPop, '.pm-pop-item');
      var first = ctxPop.querySelector('.pm-pop-item:not([aria-disabled="true"])');
      if (first) first.focus();
      ctxPop.addEventListener('click', function (e) {
        var b = e.target.closest('.pm-pop-item');
        if (!b || b.getAttribute('aria-disabled') === 'true') return;
        ctx.close(b.dataset.value);
      });
      ctxDetach = PM.portal.dismissOn(ctxPop, function () { ctx.close(null); });
      openPops.push({ el: ctxPop, close: function () { ctx.close(null); } });
    });
  };

  ctx.close = function (val) {
    if (!ctxPop) return;
    var p = ctxPop, r = ctxResolve;
    ctxPop = null; ctxResolve = null;
    if (ctxDetach) { ctxDetach(); ctxDetach = null; }
    openPops = openPops.filter(function (x) { return x.el !== p; });
    PM.sprout.close(p, function () { PM.portal.unmount(p); p.remove(); });
    if (r) r(val == null ? null : val);
  };

  /* =============================== pm-tooltip ============================ */
  var tip = {};
  var tipEl = null, tipTimer = null, tipAnchor = null, tipTrain = false;

  function ensureTip() {
    if (tipEl) return tipEl;
    tipEl = el('div', 'pm-tooltip');
    tipEl.setAttribute('role', 'tooltip');
    tipEl.id = 'pm-tooltip-singleton';
    document.body.appendChild(tipEl);
    return tipEl;
  }

  tip.show = function (anchor, text) {
    var t = ensureTip();
    tipAnchor = anchor;
    t.textContent = text;
    /* portal.place needs it laid out; mirror the stage theme so it is themed */
    var stage = anchor.closest && anchor.closest('.pm-stage');
    ['data-theme', 'data-glass-bg', 'data-motion'].forEach(function (a) {
      var v = stage && stage.getAttribute(a);
      if (v) t.setAttribute(a, v); else t.removeAttribute(a);
    });
    t.style.visibility = 'hidden';
    t.classList.add('is-open');
    PM.portal.place(t, anchor, { prefer: 'below', gap: 4 });
    t.style.visibility = '';
    tipTrain = true;
  };

  tip.hide = function () {
    if (!tipEl) return;
    tipEl.classList.remove('is-open');
    tipAnchor = null;
    clearTimeout(tipTimer);
    /* the tooltip "train": once one is visible, the next opens instantly */
    setTimeout(function () { if (!tipAnchor) tipTrain = false; }, 350);
  };

  /** Delegated. Call once. Anchors opt in with data-pm-tip="...".
   *  New panel markup must use data-pm-tip and never `title` — but the
   *  activity bar keeps `title` because 11 of those values double as JS
   *  selectors in the app ($('.activity-bar .icon[title="Chat"]'),
   *  PM7:40008). Those should later migrate to the data-ab-id attributes that
   *  already exist on all 11. */
  tip.attach = function (root) {
    if (root.__pmTipBound) return;
    root.__pmTipBound = true;
    function findAnchor(e) {
      var n = e.target;
      return n && n.closest ? n.closest('[data-pm-tip]') : null;
    }
    root.addEventListener('pointerover', function (e) {
      var a = findAnchor(e);
      if (!a || a === tipAnchor) return;
      clearTimeout(tipTimer);
      var txt = a.getAttribute('data-pm-tip');
      if (!txt) return;
      tipTimer = setTimeout(function () { tip.show(a, txt); }, tipTrain ? 0 : 400);
    });
    root.addEventListener('pointerout', function (e) {
      var a = findAnchor(e);
      if (!a) return;
      if (e.relatedTarget && a.contains(e.relatedTarget)) return;
      clearTimeout(tipTimer);
      tip.hide();
    });
    root.addEventListener('focusin', function (e) {
      var a = findAnchor(e);
      if (a && a.getAttribute('data-pm-tip')) tip.show(a, a.getAttribute('data-pm-tip'));
    });
    root.addEventListener('focusout', tip.hide);
    root.addEventListener('pointerdown', tip.hide, true);
    window.addEventListener('scroll', tip.hide, true);
  };

  /* ====================== pm-confirm / pm-input-sheet ==================== */
  function sheet(def) {
    return new Promise(function (resolve) {
      var scrim = el('div', 'pm-sheet-scrim');
      var box = el('div', 'pm-sheet');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      var titleId = nid('pm-sheet-t');
      box.setAttribute('aria-labelledby', titleId);

      var stage = def.from && def.from.closest && def.from.closest('.pm-stage');
      ['data-theme', 'data-glass-bg', 'data-density', 'data-motion', 'data-pm-fixes'].forEach(function (a) {
        var v = stage && stage.getAttribute(a);
        if (v) scrim.setAttribute(a, v);
      });

      var html = '<div class="pm-sheet-title" id="' + titleId + '">' + esc(def.title) + '</div>';
      if (def.body) html += '<div class="pm-sheet-body">' + esc(def.body) + '</div>';
      if (def.kind === 'input') {
        html += '<label class="pm-sheet-label" for="' + (def.inputId = nid('pm-in')) + '">' +
                esc(def.label || '') + '</label>' +
                '<input class="pm-sheet-input" id="' + def.inputId + '" type="text" value="' +
                esc(def.value || '') + '" placeholder="' + esc(def.placeholder || '') + '">' +
                '<div class="pm-sheet-err" data-err></div>';
      }
      html += '<div class="pm-sheet-actions">' +
        '<button class="pm-sheet-btn" data-act="cancel" type="button">' + esc(def.cancelLabel || 'Cancel') + '</button>' +
        '<button class="pm-sheet-btn pm-sheet-btn--' + (def.danger ? 'danger' : 'primary') +
          '" data-act="ok" type="button">' + esc(def.confirmLabel || 'OK') + '</button></div>';
      box.innerHTML = html;
      scrim.appendChild(box);
      document.body.appendChild(scrim);
      requestAnimationFrame(function () { scrim.classList.add('is-open'); });

      var input = box.querySelector('.pm-sheet-input');
      var errEl = box.querySelector('[data-err]');
      var untrap = PM.a11y.trapFocus(box);
      var prevFocus = document.activeElement;
      (input || box.querySelector('[data-act="ok"]')).focus();
      if (input) input.select();

      function validate() {
        if (!def.validate || !input) return true;
        var msg = def.validate(input.value);
        errEl.textContent = msg || '';
        return !msg;
      }
      function done(val) {
        untrap();
        scrim.classList.remove('is-open');
        setTimeout(function () { scrim.remove(); }, 140);
        if (prevFocus && prevFocus.focus) prevFocus.focus();
        resolve(val);
      }
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.dataset.act === 'cancel') return done(def.kind === 'input' ? null : false);
        if (def.kind === 'input') { if (validate()) done(input.value); }
        else done(true);
      });
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); done(def.kind === 'input' ? null : false); }
        if (e.key === 'Enter' && (!input || document.activeElement === input)) {
          e.preventDefault();
          if (def.kind === 'input') { if (validate()) done(input.value); } else done(true);
        }
      });
      scrim.addEventListener('pointerdown', function (e) {
        if (e.target === scrim) done(def.kind === 'input' ? null : false);
      });
      if (input) input.addEventListener('input', function () { errEl.textContent = ''; });
    });
  }

  PM.confirm = function (def) { return sheet(Object.assign({ kind: 'confirm' }, def)); };
  PM.inputSheet = function (def) { return sheet(Object.assign({ kind: 'input' }, def)); };

  /* ================================= pm-list =============================
     BLIND SPOT 17. FinalGUISpec.md:2131-2134 mandates, on EVERY list, table
     and tree: Up/Down arrows, Enter to activate, Escape to deselect, Home/End,
     and type-ahead. Not one list in the bakeoff had any of it. `PMK.row`
     emitted `tabindex="0" role="button"` and stopped there, and the only
     keyboard handlers in the codebase lived inside pm-menu and pm-select --
     which is to say the model existed, fully written, in PM.a11y.roving, and
     had simply never been pointed at a list. This points it at lists.

     ROVING TAB STOP, not 47 of them. Every row being `tabindex="0"` is not
     "more accessible"; it is the documented anti-pattern. On the Artifacts
     panel it means 47 Tab presses to reach the footer, and it destroys the
     one thing Tab is for -- moving between REGIONS. One stop per list, arrows
     within it, is the ARIA practice and is also what the app's own file tree
     will need when this ports to Slint.

     NO VERSION FILE CHANGES. Lists are discovered from the DOM by grouping
     sibling rows, so all fifteen designs get the model without an edit, and a
     design that later wraps its rows can opt in explicitly with PMK.list.

     Slint mapping: this becomes FocusScope + key handlers on the ListView;
     the roving tabindex itself is an HTML concept and is not ported. */
  var ROW_SEL = '.pmk-row,[data-pm-row]';
  /* Controls that own their own keys and their own clicks. A click on the
     overflow trigger is not a click on the row, and a keystroke inside a
     combobox is not type-ahead over rows. */
  var NESTED_SEL = 'button,a[href],input,select,textarea,[role="menuitem"],' +
                   '[role="option"],[role="tab"],[data-pm-menu],[data-pm-select]';

  var list = {};

  function allRows(host) {
    return Array.prototype.slice.call(host.querySelectorAll(ROW_SEL));
  }

  /** The row an event belongs to, or null when a nested control owns it.
   *  Exported because the harness needs exactly the same rule to decide what
   *  counts as an activation -- one definition, two consumers. */
  list.rowFromEvent = function (e) {
    var t = e.target;
    if (!t || !t.closest) return null;
    var row = t.closest(ROW_SEL);
    if (!row) return null;
    var nested = t.closest(NESTED_SEL);
    if (nested && row.contains(nested) && nested !== row) return null;
    return row;
  };

  /** Exactly one row per list carries tabindex="0". Preference order: the row
   *  the user is on, else the selected row, else the first. */
  function refreshTabStops(host, active) {
    var rows = allRows(host);
    if (!rows.length) return;
    var stop = null;
    if (active && rows.indexOf(active) >= 0) stop = active;
    if (!stop) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].classList.contains('is-selected')) { stop = rows[i]; break; }
      }
    }
    if (!stop) stop = rows[0];
    rows.forEach(function (r) { r.tabIndex = (r === stop) ? 0 : -1; });
  }

  list.select = function (host, row, emit) {
    allRows(host).forEach(function (r) {
      r.classList.toggle('is-selected', r === row);
      if (r === row) r.setAttribute('aria-pressed', 'true');
      else r.removeAttribute('aria-pressed');
    });
    refreshTabStops(host, row);
    if (emit && row) {
      row.dispatchEvent(new CustomEvent('pm:select', {
        bubbles: true, detail: { key: row.getAttribute('data-pm-key') || '', row: row }
      }));
    }
  };

  list.deselect = function (host, emit) {
    var had = null;
    allRows(host).forEach(function (r) {
      if (r.classList.contains('is-selected')) had = r;
      r.classList.remove('is-selected');
      r.removeAttribute('aria-pressed');
    });
    if (had && emit) {
      host.dispatchEvent(new CustomEvent('pm:deselect', {
        bubbles: true, detail: { key: had.getAttribute('data-pm-key') || '', row: had }
      }));
    }
    return !!had;
  };

  list.bind = function (host) {
    if (host.__pmList) return host.__pmList;
    host.__pmList = true;
    host.setAttribute('data-pm-list', '');

    /* A hand-rolled row is stamped data-pm-row on the way in, so from here
       down there is exactly ONE kind of row and the harness's activation
       handler, the selection model and the roving selector all agree without
       any of them knowing a version's class names. */
    if (host.__pmListSel) {
      Array.prototype.forEach.call(host.children, function (c) {
        if (c.matches && c.matches(host.__pmListSel)) c.setAttribute('data-pm-row', '');
      });
    }

    refreshTabStops(host, null);

    /* THE SHIELD, and it has to be registered before roving.
       PM.a11y.roving type-aheads on every printable key and swallows the
       arrows. That is right when the focus is on a row and wrong when it is
       inside the row's overflow trigger or a filter field, where those keys
       already mean something. Since both handlers sit on the same element,
       ordering plus stopImmediatePropagation is what separates them: the
       event has already reached its real target by the time it bubbles here,
       so stopping it costs the nested control nothing. */
    host.addEventListener('keydown', function (e) {
      var row = e.target && e.target.closest ? e.target.closest(ROW_SEL) : null;
      if (row !== e.target) { e.stopImmediatePropagation(); return; }

      if (e.key === 'Enter') {
        list.select(host, row, true);          /* activation itself is the shell's */
        return;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        /* role="button" says Space activates; the page says Space scrolls.
           Claim it, or the list jumps a screen every time. */
        e.preventDefault();
        list.select(host, row, true);
        return;
      }
      if (e.key === 'Escape') {
        /* Section 13.3: "Escape to deselect/go back". Only swallow it when
           there was something to deselect -- otherwise it belongs to whatever
           is open above (a menu, a sheet), which is the "go back" half. */
        if (list.deselect(host, true)) e.stopPropagation();
      }
    });

    /* Up/Down, Home/End, PageUp/PageDown and type-ahead, from the
       implementation the menus have used all along. */
    PM.a11y.roving(host, ROW_SEL);

    /* Keep the single tab stop under the user: whichever row focus lands on
       becomes the row Tab returns to. */
    host.addEventListener('focusin', function (e) {
      var row = e.target && e.target.closest ? e.target.closest(ROW_SEL) : null;
      if (row) refreshTabStops(host, row);
    });

    host.addEventListener('click', function (e) {
      var row = list.rowFromEvent(e);
      if (row) list.select(host, row, true);
    });

    return true;
  };

  /* Rows that are not KIT rows. Several versions hand-roll their row markup --
     vF-ev, xA1-row, xA2-row, xD2-row -- and matching on `.pmk-row` alone would
     leave those designs with no keyboard model at all, i.e. would leave the
     blind spot open on exactly the panels the audit says it covers.

     Recognised STRUCTURALLY and never by name, so this keeps working for a
     version written tomorrow: an element carrying an explicit LIST-ITEM role,
     its own tabindex, and at least two siblings with the same tag and the same
     first class token is a list row by construction.

     The role list is the limit on purpose. Claiming bare <button> siblings
     would also claim every chip strip, filter bar and button row in the
     bakeoff and quietly remove them from the Tab order -- a real regression
     traded for a speculative gain. A design whose rows are unlabelled buttons
     (xD3) keeps whatever model its own file gives it; making the kit guess is
     worse than leaving that visible.

     Scoped to the panel view, so the activity bar and the harness control bar
     can never be swept up. */
  var ROW_ROLE = '[role="button"],[role="option"],[role="treeitem"],' +
                 '[role="listitem"],[role="row"]';

  function firstClass(n) {
    var c = (n.className && n.className.baseVal !== undefined) ? n.className.baseVal : n.className;
    return String(c || '').trim().split(/\s+/)[0] || '';
  }

  function genericRowGroups(view) {
    var groups = [];
    var cands = view.querySelectorAll(ROW_ROLE);
    var byKey = {};
    Array.prototype.forEach.call(cands, function (n) {
      if (n.matches(ROW_SEL)) return;                 /* kit rows have their own pass */
      if (!n.hasAttribute('tabindex')) return;        /* not offered as a stop at all */
      if (n.closest('[data-pm-list]')) return;
      var p = n.parentElement;
      if (!p) return;
      var k = firstClass(n);
      if (!k) return;
      var id = k + '::' + n.tagName + '::' + n.getAttribute('role');
      var slot = byKey[id] || (byKey[id] = []);
      if (slot.indexOf(p) < 0) slot.push(p);
    });
    Object.keys(byKey).forEach(function (id) {
      var bits = id.split('::');
      var sel = bits[1].toLowerCase() + '.' + bits[0] + '[role="' + bits[2] + '"]';
      byKey[id].forEach(function (p) {
        var kids = [];
        Array.prototype.forEach.call(p.children, function (c) {
          if (c.matches && c.matches(sel)) kids.push(c);
        });
        if (kids.length >= 3) groups.push({ host: p, sel: sel });
      });
    });
    return groups;
  }

  /** Find the lists in a subtree and bind them.
   *  Discovery: an explicit [data-pm-list] wins; otherwise kit rows that share
   *  a parent are one list. A parent holding a SINGLE row is hoisted one level
   *  when the grandparent holds several -- that is the row-plus-drawer shape
   *  the drill-stack designs use, and without the hoist each row would become
   *  its own one-item list and the arrows would do nothing. Hand-rolled rows
   *  are picked up last, by shape. */
  list.mount = function (root) {
    root = root || document;
    var hosts = [], seen = [];
    function push(h, sel) {
      if (!h || hosts.indexOf(h) >= 0) return;
      if (sel) h.__pmListSel = sel;
      hosts.push(h);
    }

    Array.prototype.forEach.call(root.querySelectorAll('[data-pm-list]'), function (h) { push(h); });

    Array.prototype.forEach.call(root.querySelectorAll(ROW_SEL), function (r) {
      if (r.closest('[data-pm-list]')) return;
      var p = r.parentElement;
      if (!p || seen.indexOf(p) >= 0) return;
      seen.push(p);
      if (allRows(p).length === 1) {
        var g = p.parentElement;
        if (g && allRows(g).length > 1) { push(g); return; }
      }
      push(p);
    });

    var views = root.querySelectorAll ? root.querySelectorAll('[data-pm-panelview]') : [];
    Array.prototype.forEach.call(views, function (view) {
      genericRowGroups(view).forEach(function (g) { push(g.host, g.sel); });
    });

    hosts.forEach(function (h) {
      /* A hoist can make an earlier, narrower host redundant. Binding both
         would give the same row two roving models fighting over its
         tabindex. */
      if (h.__pmList) return;
      for (var i = 0; i < hosts.length; i++) {
        if (hosts[i] !== h && hosts[i].contains && hosts[i].contains(h)) return;
      }
      list.bind(h);
    });
  };

  /* ============================ declarative mount ======================== */
  PM.mountAll = function (root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-pm-select]'), function (n) { select.create(n); });
    Array.prototype.forEach.call(root.querySelectorAll('[data-pm-menu]'), function (n) { menu.create(n); });
    list.mount(root);

    /* Any element with data-pm-ctx opens the house context menu instead of
       the OS one. The items come from a template child, same shape as menus. */
    Array.prototype.forEach.call(root.querySelectorAll('[data-pm-ctx]'), function (n) {
      if (n.__pmCtxBound) return;
      n.__pmCtxBound = true;
      n.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        var items = readMenuTemplate(n);
        if (!items.length) return;
        ctx.open(e.clientX, e.clientY, { items: items, from: n, label: n.dataset.pmCtx || 'Context menu' });
      });
    });
  };

  PM.select = select;
  PM.menu = menu;
  PM.ctx = ctx;
  PM.tip = tip;
  PM.list = list;
  PM.icons = { caret: CARET, check: CHECK, dots: DOTS, subcaret: SUBCARET };
})(window);
