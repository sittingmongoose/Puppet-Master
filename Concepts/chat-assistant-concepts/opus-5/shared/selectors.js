/* PMX selector row — Opus 5
 *
 * Persona, Model, Mode — in that order, three peers and no more. Worktree is a fourth pill
 * appended after Mode, shown only where applicable (see worktreeApplicable below) — it is
 * never counted among the three locked peers.
 *
 * Reasoning effort is reached THROUGH Model, never presented as a fourth peer selector:
 * choosing a model opens the effort flyout as a submenu of the model popup. Model and
 * Persona lists stay searchable, and filtering resizes the popup in place with the spring
 * overshoot rather than snapping to a new height.
 *
 * Narrow-width degrade (chrome.css, @container pmx-chat): full label -> icon plus value ->
 * a single "More" affordance. The More popup drills back into these same per-dimension
 * popups anchored at the same button, so nothing is ever lost, only the always-visible
 * surface shrinks.
 */
(function (global) {
  'use strict';

  /* ---- thread-local runtime accessors ------------------------------------------------
   * Persona, provider/account/model, effort, Normal/Fast, mode, access profile, Crew and
   * worktree are THREAD-LOCAL: canon requires them to apply to this thread and future turns
   * only. They used to live at session.selectors, which is global, so choosing a model in one
   * thread silently retargeted every other thread in the project — a state leak the concepts
   * are supposed to demonstrate the absence of. The store now seeds each thread's runtime
   * from session.defaults on first touch; these three helpers are the only way this module
   * reads or writes it. */
  function rt(ctx) { return ctx.store.view(ctx.store.get('session.activeThreadId')).runtime || {}; }
  function rtGet(ctx, key) { return ctx.store.runtime(ctx.store.get('session.activeThreadId'), key); }
  function rtSet(ctx, key, value) { ctx.store.setRuntime(ctx.store.get('session.activeThreadId'), key, value); }

  function U() { return global.PMXUtil; }

  var MODELS = [
    { group: 'Anthropic', items: [{ id: 'Opus 5', provider: 'Anthropic' }, { id: 'Sonnet 5', provider: 'Anthropic' }, { id: 'Haiku 4.5', provider: 'Anthropic' }] },
    { group: 'OpenAI', items: [{ id: 'GPT-5.6 Pro', provider: 'OpenAI' }, { id: 'GPT-5.6 Mini', provider: 'OpenAI' }] },
    { group: 'Alibaba', items: [{ id: 'Qwen 3.8', provider: 'Alibaba' }] },
    { group: 'Moonshot', items: [{ id: 'Kimi K3', provider: 'Moonshot' }] }
  ];
  var PERSONAS = ['Product designer', 'Systems reviewer', 'Interface engineer', 'Research analyst', 'Technical writer'];
  var MODES = ['Ask', 'Agent', 'Plan', 'Deep Plan', 'Debug'];
  var EFFORTS = ['High', 'Medium', 'Low'];
  var WORKTREES = ['main', 'feature/replan-scope', 'hotfix/export-format'];

  /* Worktree management only makes sense for a repository-backed project. The demo corpus
   * carries exactly one project that is explicitly not repo-backed ("Personal project"), so
   * that is the ground for "only where applicable" rather than an invented rule with no data
   * behind it. Unknown or missing thread data defaults to showing the control. */
  function worktreeApplicable(ctx) {
    var tid = ctx.store.get('session.activeThreadId');
    var t = (ctx.data && typeof ctx.data.threadById === 'function') ? ctx.data.threadById(tid) : null;
    return !(t && t.project === 'Personal project');
  }

  function Selectors(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  Selectors.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  Selectors.prototype.build = function () {
    var self = this;
    var u = U();
    this.root = u.el('div', { class: 'pmx-chrome pmx-chrome-selrow' });

    this.personaBtn = this.makeBtn('persona', 'Persona');
    this.modelBtn = this.makeBtn('model', 'Model');
    this.modeBtn = this.makeBtn('mode', 'Mode');
    this.worktreeBtn = this.makeBtn('worktree', 'Worktree');

    /* Narrowest tier: every pill above hides and this single affordance takes over,
     * opening a menu that drills back into the same per-dimension popups. */
    this.moreBtn = u.el('button', { class: 'pmx-chrome-sel-more', aria: { label: 'More selectors', haspopup: 'menu' } });
    this.moreBtn.appendChild(this.ctx.services.icons.get('more', 13));
    this.moreBtn.appendChild(u.el('span', { class: 'pmx-chrome-sel-more-label', text: 'More' }));
    this._on(this.moreBtn, 'click', function (ev) { self.openMore(ev.currentTarget); });

    this.root.appendChild(this.personaBtn);
    this.root.appendChild(this.modelBtn);
    this.root.appendChild(this.modeBtn);
    this.root.appendChild(this.worktreeBtn);
    this.root.appendChild(this.moreBtn);

    this.host.appendChild(this.root);
    this.sync();
  };

  Selectors.prototype.makeBtn = function (kind, label) {
    var self = this;
    var u = U();
    var b = u.el('button', { class: 'pmx-chrome-sel', data: { kind: kind } });
    b.appendChild(u.el('span', { class: 'pmx-chrome-sel-label', text: label }));
    b.appendChild(u.el('span', { class: 'pmx-chrome-sel-value' }));
    b.appendChild(this.ctx.services.icons.get('chevron-down', 12));
    this._on(b, 'click', function (ev) { self.openFor(kind, ev.currentTarget); });
    return b;
  };

  Selectors.prototype.openFor = function (kind, anchor) {
    if (kind === 'persona') return this.openSearchable(anchor, 'Persona', PERSONAS.map(function (p) { return { id: p }; }), 'persona');
    if (kind === 'mode') return this.openPlain(anchor, 'Mode', MODES.map(function (m) { return { id: m }; }), 'mode');
    if (kind === 'worktree') return this.openPlain(anchor, 'Worktree', WORKTREES.map(function (w) { return { id: w }; }), 'worktree');
    return this.openModel(anchor);
  };

  /* Single collapsed affordance at the narrowest tier. Each row reopens the real popup for
   * that dimension, anchored at the same More button, so full functionality survives the
   * visual collapse. */
  Selectors.prototype.openMore = function (anchor) {
    var self = this;
    var u = U();
    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 230,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Selectors' }));
        var s = rt(self.ctx);

        function row(label, value, kind) {
          var item = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: label }),
            u.el('span', { class: 'pmx-popup-item-hint', text: value || '' })
          ]);
          u.on(item, 'click', function () { api.close(); self.openFor(kind, anchor); });
          host.appendChild(item);
        }

        row('Persona', s.persona, 'persona');
        row('Model', (s.model || '') + (s.effort ? ' · ' + s.effort + ' effort' : ''), 'model');
        row('Mode', s.mode, 'mode');
        if (worktreeApplicable(self.ctx)) row('Worktree', s.worktree, 'worktree');
      }
    });
  };

  Selectors.prototype.openPlain = function (anchor, title, items, key) {
    var self = this;
    var u = U();
    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 200,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: title }));
        items.forEach(function (it) {
          var cur = rtGet(self.ctx, key) === it.id;
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: it.id })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            rtSet(self.ctx, key, it.id);
            self.sync();
            api.close();
          });
          host.appendChild(row);
        });
      }
    });
  };

  Selectors.prototype.openSearchable = function (anchor, title, items, key) {
    var self = this;
    var u = U();
    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 240,
      build: function (host, api) {
        var filter = u.el('input', { class: 'pmx-popup-search', type: 'search', placeholder: 'Filter ' + title.toLowerCase(), aria: { label: 'Filter ' + title } });
        host.appendChild(filter);
        var list = u.el('div', { class: 'pmx-popup-scroll pmx-scroll' });
        host.appendChild(list);

        function render() {
          var q = filter.value.trim().toLowerCase();
          u.empty(list);
          items.filter(function (it) { return !q || it.id.toLowerCase().indexOf(q) >= 0; })
            .forEach(function (it) {
              var cur = rtGet(self.ctx, key) === it.id;
              var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
                u.el('span', { class: 'pmx-popup-item-label', text: it.id })
              ]);
              if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
              u.on(row, 'click', function () {
                rtSet(self.ctx, key, it.id);
                self.sync();
                api.close();
              });
              list.appendChild(row);
            });
          if (!list.childNodes.length) list.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No matches' }));
          /* Option count changed, so the surface resizes in place with the overshoot. */
          api.resize();
        }
        u.on(filter, 'input', render);
        render();
        setTimeout(function () { try { filter.focus(); } catch (e) {} }, 30);
      }
    });
  };

  Selectors.prototype.openModel = function (anchor) {
    var self = this;
    var u = U();
    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 260,
      build: function (host, api) {
        var filter = u.el('input', { class: 'pmx-popup-search', type: 'search', placeholder: 'Filter models', aria: { label: 'Filter models' } });
        host.appendChild(filter);
        var list = u.el('div', { class: 'pmx-popup-scroll pmx-scroll' });
        host.appendChild(list);

        function render() {
          var q = filter.value.trim().toLowerCase();
          u.empty(list);
          MODELS.forEach(function (grp) {
            var matches = grp.items.filter(function (it) { return !q || it.id.toLowerCase().indexOf(q) >= 0; });
            if (!matches.length) return;
            list.appendChild(u.el('div', { class: 'pmx-popup-group', text: grp.group }));
            matches.forEach(function (it) {
              var cur = rtGet(self.ctx, 'model') === it.id;
              var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
                u.el('span', { class: 'pmx-popup-item-label', text: it.id }),
                u.el('span', { class: 'pmx-popup-item-hint', text: rtGet(self.ctx, 'effort') })
              ]);
              row.appendChild(self.ctx.services.icons.get('chevron-right', 12));
              u.on(row, 'click', function (ev) {
                rtSet(self.ctx, 'model', it.id);
                rtSet(self.ctx, 'provider', it.provider);
                self.sync();
                /* Effort is chained off Model as a submenu — never a fourth peer control. */
                self.openEffort(ev.currentTarget, api);
              });
              list.appendChild(row);
            });
          });
          if (!list.childNodes.length) list.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No matches' }));
          api.resize();
        }
        u.on(filter, 'input', render);
        render();
        setTimeout(function () { try { filter.focus(); } catch (e) {} }, 30);
      }
    });
  };

  Selectors.prototype.openEffort = function (rowEl, parentApi) {
    var self = this;
    var u = U();
    parentApi.openSubmenu({
      anchorEl: rowEl, kind: 'menu', width: 150,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Reasoning effort' }));
        EFFORTS.forEach(function (e) {
          var cur = rtGet(self.ctx, 'effort') === e;
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: e })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            rtSet(self.ctx, 'effort', e);
            self.sync();
            self.ctx.services.popup.closeAll(null);
          });
          host.appendChild(row);
        });
      }
    });
  };

  Selectors.prototype.sync = function () {
    var s = rt(this.ctx);
    this.personaBtn.querySelector('.pmx-chrome-sel-value').textContent = s.persona || '';
    this.modelBtn.querySelector('.pmx-chrome-sel-value').textContent = s.model || '';
    this.modeBtn.querySelector('.pmx-chrome-sel-value').textContent = s.mode || '';
    this.worktreeBtn.querySelector('.pmx-chrome-sel-value').textContent = s.worktree || '';
    this.modelBtn.title = 'Model ' + (s.model || '') + ', effort ' + (s.effort || '');
    var applicable = worktreeApplicable(this.ctx);
    this.root.setAttribute('data-pmx-worktree', applicable ? '1' : '0');
  };

  Selectors.prototype.update = function (state, changed) {
    for (var i = 0; i < changed.length; i++) {
      /* view.runtime matters as much as session now: the selectors read thread-local state,
       * so switching threads or changing a route has to re-render this row. */
      if (changed[i].indexOf('session') === 0 || changed[i].indexOf('view') === 0) { this.sync(); return; }
    }
  };

  Selectors.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  global.PMXSelectors = {
    mount: function (host, ctx) { return new Selectors(host, ctx); },
    MODELS: MODELS, PERSONAS: PERSONAS, MODES: MODES, EFFORTS: EFFORTS, WORKTREES: WORKTREES
  };
})(window);
