/* PMX selector row — Opus 5
 *
 * The visible peer set is Persona, Route, Mode, Access, BSD — plus Worktree and Crew where
 * they apply. Five peers, not eight, and the two conditional ones are never counted among
 * them.
 *
 * WHAT IS NOT A PEER, AND WHY
 * --------------------------
 * Reasoning effort and Normal/Fast are reached THROUGH Route (CONTRACT §8.9, CHAT-002). They
 * are properties OF a route, not independent axes: `Haiku 4.5` has no effort axis at all and
 * `Opus 5` has no Fast tier, so a peer control for either would be a permanently dead pill on
 * half the catalog. As submenus of the model row they are simply ABSENT when the adapter does
 * not offer them — which is the packet's rule and also the honest shape.
 *
 * THE ROUTE POPUP IS A STACK, NOT A SEQUENCE OF OVERLAYS
 * ----------------------------------------------------
 * `api.openSubmenu` keeps the parent open (shared/popup.js:470-480). That matters because
 * choosing a model and then its effort is one decision with two parts: if picking the model
 * closed the catalog, the user would lose the group headers, the account they were comparing
 * against, and their filter text. Independent base popups deliberately do NOT stack — a new
 * base calls closeAll — so the submenu stack is the only correct mechanism here.
 *
 * A ROUTE IS AN (ACCOUNT, MODEL) PAIR
 * ----------------------------------
 * `Opus 5` appears under two Anthropic accounts with different connections and different
 * setup states. The popup therefore groups by ACCOUNT and never presents a bare model list;
 * PMXRoute owns the catalog and this file owns none of it.
 *
 * Narrow-width degrade (chrome.css, @container pmx-chat): full label -> icon plus value ->
 * a single "More" affordance. The More popup drills back into these same per-dimension
 * popups anchored at the same button, so nothing is ever lost, only the always-visible
 * surface shrinks.
 */
(function (global) {
  'use strict';

  /* ---- thread-local runtime accessors ------------------------------------------------
   * Persona, provider/account/model, effort, Normal/Fast, mode, access profile, BSD, Crew and
   * worktree are THREAD-LOCAL: canon requires them to apply to this thread and future turns
   * only. They used to live at session.selectors, which is global, so choosing a model in one
   * thread silently retargeted every other thread in the project — a state leak the concepts
   * are supposed to demonstrate the absence of. The store seeds each thread's runtime from
   * session.defaults on first touch; these helpers are the only way this module reads or
   * writes it, and nothing here ever writes session.defaults. */
  function tid(ctx) { return ctx.store.get('session.activeThreadId'); }
  function rt(ctx) { return ctx.store.view(tid(ctx)).runtime || {}; }
  function rtGet(ctx, key) { return ctx.store.runtime(tid(ctx), key); }
  function rtSet(ctx, key, value) { ctx.store.setRuntime(tid(ctx), key, value); }

  function U() { return global.PMXUtil; }

  function svc(ctx, key, fallback) {
    var s = ctx && ctx.services && ctx.services[key];
    return s || global[fallback] || null;
  }

  var PERSONAS = ['Product designer', 'Systems reviewer', 'Interface engineer', 'Research analyst', 'Technical writer'];
  /* `Review` joins the mode list because the access ladder narrows on it: Plan, Deep Plan and
   * Review all cap at Auto accept edits, and without the mode present that rule is
   * undemonstrable. */
  var MODES = ['Ask', 'Agent', 'Plan', 'Deep Plan', 'Review', 'Debug'];
  var WORKTREES = ['main', 'feature/replan-scope', 'hotfix/export-format'];

  /* The scope hint every per-thread popup carries in its footer. One short line, because the
   * question "does this change my other threads?" must never require a guess (06_...:63). */
  var SCOPE_HINT = 'This thread';

  /* Broadening a selection past this thread is a separate, consequential action, so it is
   * gated by a real decision record rather than a second click. The question is verbatim
   * (06_COMPOSER_SPELLCHECK_AND_THREAD_LOCAL_STATE.md:69). */
  var BROADEN_QUESTION = 'Apply Deep Researcher to all threads in this PlanningRun?';

  /* Worktree management only makes sense for a repository-backed project. The demo corpus
   * carries exactly one project that is explicitly not repo-backed ("Personal project"), so
   * that is the ground for "only where applicable" rather than an invented rule with no data
   * behind it. Unknown or missing thread data defaults to showing the control. */
  function worktreeApplicable(ctx) {
    var t = (ctx.data && typeof ctx.data.threadById === 'function') ? ctx.data.threadById(tid(ctx)) : null;
    return !(t && t.project === 'Personal project');
  }

  /* Crew is an Agent-mode arrangement: a crew of specialists only makes sense when the thread
   * is allowed to act. In Ask or Plan it would be a control that cannot start anything. */
  function crewApplicable(ctx) {
    var crew = svc(ctx, 'crew', 'PMXCrew');
    if (!crew || typeof crew.templates !== 'function') return false;
    return crew.templates().length > 0 && rtGet(ctx, 'mode') === 'Agent';
  }

  function Selectors(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.providerFilter = null;   /* provider id, or null for "every account" */
    this.build();
  }

  Selectors.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  Selectors.prototype.build = function () {
    var self = this;
    var u = U();
    this.root = u.el('div', { class: 'pmx-chrome pmx-chrome-selrow' });

    this.personaBtn = this.makeBtn('persona', 'Persona');
    this.routeBtn = this.makeBtn('route', 'Route');
    this.modeBtn = this.makeBtn('mode', 'Mode');
    this.accessBtn = this.makeBtn('access', 'Access');
    this.bsdBtn = this.makeBtn('bsd', 'Back Seat Driver');
    this.worktreeBtn = this.makeBtn('worktree', 'Worktree');
    this.crewBtn = this.makeBtn('crew', 'Crew');

    /* Narrowest tier: every pill above hides and this single affordance takes over,
     * opening a menu that drills back into the same per-dimension popups. */
    this.moreBtn = u.el('button', { class: 'pmx-chrome-sel-more', aria: { label: 'More selectors', haspopup: 'menu' } });
    this.moreBtn.appendChild(this.ctx.services.icons.get('more', 13));
    this.moreBtn.appendChild(u.el('span', { class: 'pmx-chrome-sel-more-label', text: 'More' }));
    this._on(this.moreBtn, 'click', function (ev) { self.openMore(ev.currentTarget); });

    this.root.appendChild(this.personaBtn);
    this.root.appendChild(this.routeBtn);
    this.root.appendChild(this.modeBtn);
    this.root.appendChild(this.accessBtn);
    this.root.appendChild(this.bsdBtn);
    this.root.appendChild(this.worktreeBtn);
    this.root.appendChild(this.crewBtn);
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
    if (kind === 'access') return this.openAccess(anchor);
    if (kind === 'bsd') return this.openBsd(anchor);
    if (kind === 'crew') return this.openCrew(anchor);
    return this.openRoute(anchor);
  };

  /* One shared footer builder so every per-thread popup carries the same scope statement in
   * the same place. */
  Selectors.prototype.scopeFooter = function (host, extraLine) {
    var u = U();
    var foot = u.el('div', { class: 'pmx-popup-foot' });
    if (extraLine) foot.appendChild(u.el('div', { class: 'pmx-popup-foot-line', text: extraLine }));
    foot.appendChild(u.el('div', { class: 'pmx-popup-scope', text: SCOPE_HINT }));
    host.appendChild(foot);
    return foot;
  };

  /* Single collapsed affordance at the narrowest tier. Each row reopens the real popup for
   * that dimension, anchored at the same More button, so full functionality survives the
   * visual collapse. */
  Selectors.prototype.openMore = function (anchor) {
    var self = this;
    var u = U();
    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 250,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Selectors' }));

        function row(label, value, kind) {
          var item = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: label }),
            u.el('span', { class: 'pmx-popup-item-hint', text: value || '' })
          ]);
          u.on(item, 'click', function () { api.close(); self.openFor(kind, anchor); });
          host.appendChild(item);
        }

        row('Persona', rtGet(self.ctx, 'persona'), 'persona');
        row('Route', self.routeLabel(), 'route');
        row('Mode', rtGet(self.ctx, 'mode'), 'mode');
        row('Access', self.accessLabel(), 'access');
        row('Back Seat Driver', self.bsdLabel(), 'bsd');
        if (worktreeApplicable(self.ctx)) row('Worktree', rtGet(self.ctx, 'worktree'), 'worktree');
        if (crewApplicable(self.ctx)) row('Crew', self.crewLabel(), 'crew');
        self.scopeFooter(host);
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
        self.scopeFooter(host);
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
        self.scopeFooter(host);
        setTimeout(function () { try { filter.focus(); } catch (e) {} }, 30);
      }
    });
  };

  /* ------------------------------------------------------------------ Route */

  Selectors.prototype.openRoute = function (anchor) {
    var self = this;
    var u = U();
    var route = svc(this.ctx, 'route', 'PMXRoute');
    if (!route) return null;

    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 300,
      build: function (host, api) {
        /* Provider rail. Six neutral geometric marks, horizontal, click to filter. It is a
         * filter and not a selector: a provider is not a route, so choosing one narrows the
         * account groups below rather than changing anything. */
        var rail = u.el('div', { class: 'pmx-route-rail', aria: { label: 'Filter by provider' } });
        route.providers().forEach(function (p) {
          var mark = u.el('button', {
            class: 'pmx-route-mark', type: 'button', title: p.name,
            data: { provider: p.id, on: self.providerFilter === p.id ? '1' : '0' },
            aria: { pressed: self.providerFilter === p.id ? 'true' : 'false', label: p.name }
          }, self.ctx.services.icons.get(p.icon, 15));
          u.on(mark, 'click', function () {
            self.providerFilter = (self.providerFilter === p.id) ? null : p.id;
            render();
          });
          rail.appendChild(mark);
        });
        host.appendChild(rail);

        var filter = u.el('input', { class: 'pmx-popup-search', type: 'search', placeholder: 'Filter models', aria: { label: 'Filter models' } });
        host.appendChild(filter);

        var list = u.el('div', { class: 'pmx-popup-scroll pmx-scroll' });
        host.appendChild(list);
        var footHost = u.el('div', { class: 'pmx-route-foot' });
        host.appendChild(footHost);

        function modelRow(m, opts) {
          var cur = rtGet(self.ctx, 'model') === m.name && rtGet(self.ctx, 'account') === m.accountLabel;
          var row = u.el('button', {
            class: 'pmx-route-row', type: 'button',
            data: { available: m.available ? '1' : '0' },
            aria: { checked: cur ? 'true' : 'false', disabled: m.available ? 'false' : 'true' }
          });
          row.appendChild(u.el('span', { class: 'pmx-route-name', text: m.name }));

          /* At most three compact facts. PMXRoute already caps the array; rendering it
           * verbatim is what keeps a badge wall impossible (01_...:20). */
          var facts = u.el('span', { class: 'pmx-route-facts' });
          (m.facts || []).forEach(function (f) {
            facts.appendChild(u.el('span', { class: 'pmx-route-fact', text: f }));
          });
          row.appendChild(facts);

          if (!m.available) {
            /* Non-activating, with the reason inline. A disabled row that does not say why is
             * the thing the packet is trying to eliminate. */
            row.appendChild(u.el('span', { class: 'pmx-route-reason', text: m.disabledReason || 'Unavailable' }));
            u.on(row, 'click', function (ev) { ev.preventDefault(); });
          } else {
            if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
            else row.appendChild(self.ctx.services.icons.get('chevron-right', 12));
            u.on(row, 'click', function (ev) {
              var res = route.setRoute(tid(self.ctx), { accountId: m.accountId, model: m.name });
              self.sync();
              if (res && res.warning) {
                /* The consequence surfaces in the thread's own decision list; the picker does
                 * not become a warning dialog. */
                self.ctx.store.touchView('decisions');
              }
              self.openRouteSubmenus(ev.currentTarget, api, m);
            });
          }

          /* The star is a separate control inside the row, so favouriting never selects. */
          var favs = route.favorites();
          var isFav = favs.models.indexOf(m.id) >= 0 || favs.models.indexOf(m.name) >= 0;
          var star = u.el('button', {
            class: 'pmx-route-star', type: 'button',
            aria: { pressed: isFav ? 'true' : 'false', label: (isFav ? 'Remove ' : 'Add ') + m.name + ' to favorites' }
          }, self.ctx.services.icons.get(isFav ? 'star-filled' : 'star', 13));
          u.on(star, 'click', function (ev) {
            ev.stopPropagation();
            route.toggleFavorite('models', m.id);
            render();
          });
          row.appendChild(star);

          if (opts && opts.suffix) row.appendChild(u.el('span', { class: 'pmx-route-suffix', text: opts.suffix }));
          return row;
        }

        function render() {
          var q = filter.value.trim().toLowerCase();
          u.empty(list);
          u.empty(footHost);

          var rail2 = host.querySelector('.pmx-route-rail');
          if (rail2) {
            var marks = rail2.querySelectorAll('.pmx-route-mark');
            for (var mi = 0; mi < marks.length; mi++) {
              var on = marks[mi].getAttribute('data-provider') === self.providerFilter;
              marks[mi].setAttribute('data-on', on ? '1' : '0');
              marks[mi].setAttribute('aria-pressed', on ? 'true' : 'false');
            }
          }

          var accounts = route.accounts();
          var allModels = route.models(null);
          function matches(m) {
            if (q && m.name.toLowerCase().indexOf(q) < 0) return false;
            if (self.providerFilter && m.providerId !== self.providerFilter) return false;
            return true;
          }

          /* Favorites and Recents are separate groups because they answer different
           * questions: one is what you chose to keep, the other is where you have just been. */
          var favs = route.favorites();
          var favRows = allModels.filter(function (m) {
            return matches(m) && (favs.models.indexOf(m.id) >= 0 || favs.models.indexOf(m.name) >= 0);
          });
          if (favRows.length) {
            list.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Favorites' }));
            favRows.forEach(function (m) { list.appendChild(modelRow(m, { suffix: m.accountLabel })); });
          }

          var rec = route.recents();
          var recRows = [];
          rec.models.forEach(function (rid) {
            allModels.forEach(function (m) { if (m.id === rid && matches(m)) recRows.push(m); });
          });
          if (recRows.length) {
            list.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Recents' }));
            recRows.forEach(function (m) { list.appendChild(modelRow(m, { suffix: m.accountLabel })); });
          }

          var anyUnready = false;
          accounts.forEach(function (a) {
            if (a.state !== 'ready') anyUnready = true;
            if (self.providerFilter && a.providerId !== self.providerFilter) return;
            var rows = allModels.filter(function (m) { return m.accountId === a.id && matches(m); });
            if (!rows.length) return;

            /* Account group header carries the connection form and the state chip, because
             * "which credential is this" and "is it usable" are the two facts that make two
             * accounts offering the same model distinguishable at a glance. */
            var head = u.el('div', { class: 'pmx-route-acct' }, [
              u.el('span', { class: 'pmx-route-acct-label', text: a.label }),
              u.el('span', { class: 'pmx-route-acct-conn', text: a.connection })
            ]);
            if (a.state !== 'ready') {
              head.appendChild(u.el('span', {
                class: 'pmx-route-acct-state', text: route.setupReason(a.state)
              }));
            }
            list.appendChild(head);
            rows.forEach(function (m) { list.appendChild(modelRow(m)); });
          });

          if (!list.childNodes.length) list.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No matches' }));

          /* Footer appears only when there is something to fix. A permanent settings link
           * would train the reader to ignore it. */
          if (anyUnready) {
            var target = route.settingsTarget(accounts.filter(function (a) { return a.state !== 'ready'; })[0].id);
            var btn = u.el('button', { class: 'pmx-route-settings', type: 'button', text: target.label });
            u.on(btn, 'click', function () {
              var toast = svc(self.ctx, 'toast', 'PMXToast');
              if (toast) toast.show(target.destination + ' · ' + target.returnContext.returnLabel);
              api.close();
            });
            footHost.appendChild(btn);
          }
          self.scopeFooter(footHost);
          api.resize();
        }

        u.on(filter, 'input', render);
        render();
        setTimeout(function () { try { filter.focus(); } catch (e) {} }, 30);
      }
    });
  };

  /* Effort and Speed as a submenu stack off the model row. The base popup stays open the
   * whole time — that is the requirement and the reason openSubmenu exists. */
  Selectors.prototype.openRouteSubmenus = function (rowEl, parentApi, model) {
    var self = this;
    var u = U();
    var route = svc(this.ctx, 'route', 'PMXRoute');
    var efforts = route.effort(model.id);
    var canFast = route.supportsFast(model.id);

    /* No effort axis and no speed axis: there is nothing to chain, so the decision is already
     * complete and the stack closes rather than opening an empty menu. */
    if (!efforts && !canFast) { this.ctx.services.popup.closeAll(null); return; }

    if (!efforts) { this.openSpeed(rowEl, parentApi, model); return; }

    parentApi.openSubmenu({
      anchorEl: rowEl, kind: 'menu', width: 180,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Reasoning effort' }));
        efforts.forEach(function (e) {
          var cur = rtGet(self.ctx, 'effort') === e;
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: e })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function (ev) {
            rtSet(self.ctx, 'effort', e);
            self.sync();
            if (canFast) self.openSpeed(ev.currentTarget, api, model);
            else self.ctx.services.popup.closeAll(null);
          });
          host.appendChild(row);
        });

        if (!canFast) {
          /* The model has no Fast tier on this route. Saying so once, non-activating, is more
           * useful than omitting Speed silently and leaving the reader to wonder. */
          host.appendChild(u.el('div', { class: 'pmx-popup-note', text: route.FAST_UNAVAILABLE_LINE }));
        } else {
          host.appendChild(u.el('div', { class: 'pmx-popup-hint', text: 'Speed follows' }));
        }
      }
    });
  };

  Selectors.prototype.openSpeed = function (rowEl, parentApi, model) {
    var self = this;
    var u = U();
    parentApi.openSubmenu({
      anchorEl: rowEl, kind: 'menu', width: 180,
      build: function (host) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Speed' }));
        [['normal', 'Normal'], ['fast', 'Fast']].forEach(function (pair) {
          var cur = rtGet(self.ctx, 'speed') === pair[0];
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: pair[1] })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            rtSet(self.ctx, 'speed', pair[0]);
            self.sync();
            self.ctx.services.popup.closeAll(null);
          });
          host.appendChild(row);
        });
      }
    });
  };

  /* ------------------------------------------------------------------ Access */

  Selectors.prototype.openAccess = function (anchor) {
    var self = this;
    var u = U();
    var access = svc(this.ctx, 'access', 'PMXAccess');
    if (!access) return null;

    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 280,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Access' }));
        var eff = access.effective(tid(self.ctx));
        access.PROFILES.forEach(function (p) {
          var cur = access.get(tid(self.ctx)) === p.id;
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: p.label })
          ]);
          /* When a mode has narrowed authority, the profiles above the ceiling still appear —
           * the user may pick one and it will apply once the mode changes — but the footer
           * states what is actually in force right now. */
          if (eff.narrowedBy && p.id !== eff.profile && rankAbove(access, p.id, eff.profile)) {
            row.appendChild(u.el('span', { class: 'pmx-popup-item-hint', text: 'Limited by ' + eff.narrowedBy + ' mode' }));
          }
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            access.set(tid(self.ctx), p.id);
            self.sync();
            api.close();
          });
          host.appendChild(row);
        });

        /* The one line that states the effective profile, verbatim from PMXAccess so the
         * wording cannot drift between the footer and the composer. */
        host.appendChild(u.el('div', { class: 'pmx-popup-effective', text: access.effective(tid(self.ctx)).line }));

        /* Plan and Review are not blind modes (06_...:77) — the disclosure proves it by
         * listing the families that stay available. */
        var disc = u.el('details', { class: 'pmx-popup-disclosure' });
        disc.appendChild(u.el('summary', { text: 'Plan and Review tool access' }));
        var tools = access.toolsFor(rtGet(self.ctx, 'mode'));
        var ul = u.el('ul', { class: 'pmx-popup-tools' });
        tools.forEach(function (t) { ul.appendChild(u.el('li', { text: t })); });
        disc.appendChild(ul);
        host.appendChild(disc);

        self.scopeFooter(host);
        api.resize();
      }
    });
  };

  function rankAbove(access, a, b) {
    var order = ['ask', 'auto_edits', 'auto', 'full'];
    return order.indexOf(a) > order.indexOf(b);
  }

  /* ------------------------------------------------------------------ BSD */

  Selectors.prototype.openBsd = function (anchor) {
    var self = this;
    var u = U();
    var bsd = svc(this.ctx, 'bsd', 'PMXBsd');
    if (!bsd) return null;

    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 230,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Back Seat Driver' }));
        [['off', 'Off'], ['auto', 'Auto — system default'], ['on', 'On']].forEach(function (pair) {
          var cur = bsd.mode(tid(self.ctx)) === pair[0];
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: pair[1] })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            bsd.set(tid(self.ctx), pair[0], bsd.scope(tid(self.ctx)));
            self.sync();
            api.close();
          });
          host.appendChild(row);
        });

        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Applies to' }));
        [['turn', 'This turn'], ['thread', 'This thread']].forEach(function (pair) {
          var cur = bsd.scope(tid(self.ctx)) === pair[0];
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: pair[1] })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            bsd.set(tid(self.ctx), bsd.mode(tid(self.ctx)), pair[0]);
            self.sync();
            api.close();
          });
          host.appendChild(row);
        });
        self.scopeFooter(host);
      }
    });
  };

  /* ------------------------------------------------------------------ Crew */

  Selectors.prototype.openCrew = function (anchor) {
    var self = this;
    var u = U();
    var crew = svc(this.ctx, 'crew', 'PMXCrew');
    if (!crew) return null;

    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 270,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Crew' }));
        var active = crew.of(tid(self.ctx));

        crew.templates().forEach(function (t) {
          var cur = active && active.templateId === t.id;
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label', text: t.name }),
            u.el('span', { class: 'pmx-popup-item-hint', text: t.roles.length + ' roles' })
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            crew.start(tid(self.ctx), t.id);
            self.sync();
            /* The board is a produced artifact, so starting a crew opens the one place in this
             * product where produced work is read. */
            var art = svc(self.ctx, 'artifacts', 'PMXArtifacts');
            if (art) art.open('artifact-crew');
            api.close();
          });
          host.appendChild(row);
        });

        if (active) {
          var stop = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: 'Stop crew' })
          ]);
          u.on(stop, 'click', function () { crew.stop(tid(self.ctx)); self.sync(); api.close(); });
          host.appendChild(stop);
        }

        /* Broadening past this thread is a decision, not a toggle. */
        var broaden = u.el('button', { class: 'pmx-popup-item' }, [
          u.el('span', { class: 'pmx-popup-item-label', text: 'Apply to all threads in this PlanningRun…' })
        ]);
        u.on(broaden, 'click', function () {
          var ap = svc(self.ctx, 'approvals', 'PMXApprovals');
          if (ap) {
            ap.raise(tid(self.ctx), {
              kind: 'approval', severity: 'material',
              question: BROADEN_QUESTION,
              scopeLine: 'Every thread in this PlanningRun · Applies to future turns',
              details: {
                commands: [], files: [], servers: [], domains: [],
                persistence: 'Until changed per thread',
                saferAlternative: 'Leave it on this thread and broaden later',
                receipts: []
              }
            });
          }
          api.close();
        });
        host.appendChild(broaden);
        self.scopeFooter(host);
        api.resize();
      }
    });
  };

  /* ------------------------------------------------------------------ labels */

  Selectors.prototype.routeLabel = function () {
    var route = svc(this.ctx, 'route', 'PMXRoute');
    var s = rt(this.ctx);
    var parts = [];
    if (route) {
      var eff = route.effective(tid(this.ctx));
      /* When the requested route cannot be honoured the collapsed label shows BOTH, because a
       * silent substitution is the failure mode this whole axis exists to prevent (PROV-017). */
      if (eff.differs) parts.push(eff.requested.model + ' \u2192 ' + eff.effective.model);
      else parts.push(s.model || '');
    } else {
      parts.push(s.model || '');
    }
    if (s.effort) parts.push(s.effort);
    if (s.speed === 'fast') parts.push('Fast');
    return parts.join(' \u00b7 ');
  };

  Selectors.prototype.accessLabel = function () {
    var access = svc(this.ctx, 'access', 'PMXAccess');
    if (!access) return '';
    return access.effective(tid(this.ctx)).label;
  };

  Selectors.prototype.bsdLabel = function () {
    var bsd = svc(this.ctx, 'bsd', 'PMXBsd');
    if (!bsd) return '';
    var mode = bsd.mode(tid(this.ctx));
    if (mode === 'off') return 'Off';
    if (mode === 'on') return 'On';
    return 'Auto';
  };

  Selectors.prototype.crewLabel = function () {
    var crew = svc(this.ctx, 'crew', 'PMXCrew');
    var rec = crew && crew.of(tid(this.ctx));
    return rec ? rec.name : 'None';
  };

  Selectors.prototype.sync = function () {
    var s = rt(this.ctx);
    var route = svc(this.ctx, 'route', 'PMXRoute');
    var bsd = svc(this.ctx, 'bsd', 'PMXBsd');

    this.personaBtn.querySelector('.pmx-chrome-sel-value').textContent = s.persona || '';
    this.routeBtn.querySelector('.pmx-chrome-sel-value').textContent = this.routeLabel();
    this.modeBtn.querySelector('.pmx-chrome-sel-value').textContent = s.mode || '';
    this.accessBtn.querySelector('.pmx-chrome-sel-value').textContent = this.accessLabel();
    this.bsdBtn.querySelector('.pmx-chrome-sel-value').textContent = this.bsdLabel();
    this.worktreeBtn.querySelector('.pmx-chrome-sel-value').textContent = s.worktree || '';
    this.crewBtn.querySelector('.pmx-chrome-sel-value').textContent = this.crewLabel();

    if (route) {
      var eff = route.effective(tid(this.ctx));
      this.routeBtn.setAttribute('data-pmx-differs', eff.differs ? '1' : '0');
      this.routeBtn.title = eff.differs
        ? (eff.reason || 'The requested route is unavailable.')
        : ('Route ' + (s.account || '') + ' · ' + (s.model || ''));
    }

    /* BSD's visual state drives a data attribute rather than a class per state, so the eight
     * concepts can key their own treatment off one contract. `auto-active` is the only glow,
     * and it carries data-pmx-op so the motion contract can prove a live operation backs it —
     * an indefinite pulse with no running op is a hard failure. */
    if (bsd) {
      var vs = bsd.visualState(tid(this.ctx));
      this.bsdBtn.setAttribute('data-pmx-bsd', vs);
      var opId = bsd.opId ? bsd.opId(tid(this.ctx)) : null;
      if (vs === 'auto-active' && opId) this.bsdBtn.setAttribute('data-pmx-op', opId);
      else this.bsdBtn.removeAttribute('data-pmx-op');
    }

    this.root.setAttribute('data-pmx-worktree', worktreeApplicable(this.ctx) ? '1' : '0');
    this.root.setAttribute('data-pmx-crew', crewApplicable(this.ctx) ? '1' : '0');
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
    PERSONAS: PERSONAS, MODES: MODES, WORKTREES: WORKTREES,
    SCOPE_HINT: SCOPE_HINT, BROADEN_QUESTION: BROADEN_QUESTION
  };
})(window);
