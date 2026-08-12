/* PMX header tools — Opus 5
 *
 * Search, Prior chats, Context Lens, Context ring, Environment, Sync state, More options, then
 * the selector row. Mounted into whatever region the window designates, so behaviour is
 * identical everywhere.
 *
 * WHY `Environment` IS ONE CHIP AND NOT A PANEL
 * -------------------------------------------
 * Ports, worktrees, sessions, resource pressure, provider allowance and recovery points are all
 * real and all needed, but Chat is not a host console. The packet is explicit that Chat shows
 * compact task-relevant summaries and actionable conflicts only
 * (03_GOAL_TODO_SUBAGENTS_CREW_AND_OPERATIONAL_AWARENESS.md:113) and forbids repeating a giant
 * host banner (05_...:97, CHAT-019). So the entire operational surface collapses to one chip
 * whose popup has six short groups, and anything deeper lives in Settings. One chip is also what
 * makes the narrow fold honest: at chatWidth < 750 it folds into More options and nothing is lost.
 *
 * WHY THE RING POPUP IS NOW AN ADMISSION RECEIPT
 * --------------------------------------------
 * A percentage tells the user they are near a limit and nothing about what to do. The receipt
 * lists what was ADMITTED, with provenance and a per-row Remove, and what was LEFT OUT, with the
 * reason. `Compact now` used to be a toast that changed nothing; it now runs a real observable
 * operation through PMXContextAdmit and shows the resulting receipt, because a control that
 * claims to reduce context and does not is worse than no control.
 *
 * Every item in every menu here performs a real state change, raises a real decision, or starts a
 * real observable operation. A decorative menu item is a hard failure (CHAT-013).
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  /* Below this chat width the three widest chips fold into More options. Same threshold the
   * selector row uses, so the header degrades in one step rather than three. */
  var FOLD_WIDTH = 750;

  function HeaderTools(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  HeaderTools.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  HeaderTools.prototype.svc = function (key, fallback) {
    var s = this.ctx.services && this.ctx.services[key];
    return s || global[fallback] || null;
  };

  HeaderTools.prototype.tid = function () { return this.ctx.store.get('session.activeThreadId'); };

  HeaderTools.prototype.build = function () {
    var self = this;
    var u = U();

    this.root = u.el('div', { class: 'pmx-chrome pmx-chrome-header' });

    /* Exactly one search bar. There is no second Lens-specific search anywhere. */
    this.searchBtn = this.iconBtn('search', 'Search', function (ev) {
      self.ctx.services.search.openPopup(ev.currentTarget, self.ctx);
    });
    this.root.appendChild(this.searchBtn);

    this.priorBtn = this.iconBtn('thread', 'Prior chats', function (ev) { self.openPriorChats(ev.currentTarget); });
    this.root.appendChild(this.priorBtn);

    this.lensBtn = this.iconBtn('lens', 'Context Lens', function (ev) { self.openLens(ev.currentTarget); });
    this.root.appendChild(this.lensBtn);

    this.ringBtn = u.el('button', { class: 'pmx-chrome-ring', aria: { label: 'Context use' } });
    this.ringBtn.title = 'Context use';
    this.ringBtn.appendChild(this.buildRing());
    this._on(this.ringBtn, 'click', function (ev) { self.openRing(ev.currentTarget); });
    this.root.appendChild(this.ringBtn);

    this.envBtn = this.iconBtn('gauge', 'Environment', function (ev) { self.openEnvironment(ev.currentTarget); });
    this.root.appendChild(this.envBtn);

    this.syncBtn = this.iconBtn('offline', 'Sync state', function (ev) { self.openSync(ev.currentTarget); });
    this.root.appendChild(this.syncBtn);

    this.moreBtn = this.iconBtn('more', 'More options', function (ev) { self.openMore(ev.currentTarget); });
    this.root.appendChild(this.moreBtn);

    this.selHost = u.el('div', { class: 'pmx-chrome-selhost' });
    this.root.appendChild(this.selHost);

    this.host.appendChild(this.root);
    this.selectors = global.PMXSelectors.mount(this.selHost, this.ctx);
    this.syncLens();
    this.syncChips();
  };

  HeaderTools.prototype.iconBtn = function (icon, label, fn) {
    var u = U();
    var b = u.el('button', { class: 'pmx-chrome-btn', aria: { label: label } });
    b.title = label;
    b.appendChild(this.ctx.services.icons.get(icon, 15));
    this._on(b, 'click', fn);
    return b;
  };

  /* A small SVG gauge. The ring is the entry point; the receipt below is the substance. */
  HeaderTools.prototype.buildRing = function () {
    var used = this.contextUse();
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var bg = document.createElementNS(ns, 'circle');
    bg.setAttribute('cx', '12'); bg.setAttribute('cy', '12'); bg.setAttribute('r', '9');
    bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', 'currentColor');
    bg.setAttribute('stroke-opacity', '.22'); bg.setAttribute('stroke-width', '3');
    svg.appendChild(bg);
    var arc = document.createElementNS(ns, 'circle');
    var circ = 2 * Math.PI * 9;
    arc.setAttribute('cx', '12'); arc.setAttribute('cy', '12'); arc.setAttribute('r', '9');
    arc.setAttribute('fill', 'none'); arc.setAttribute('stroke', 'currentColor');
    arc.setAttribute('stroke-width', '3'); arc.setAttribute('stroke-linecap', 'round');
    arc.setAttribute('stroke-dasharray', circ.toFixed(2));
    arc.setAttribute('stroke-dashoffset', (circ * (1 - used.ratio)).toFixed(2));
    arc.setAttribute('transform', 'rotate(-90 12 12)');
    svg.appendChild(arc);
    return svg;
  };

  /* Prefer the admission receipt's own pressure figure so the ring and the receipt cannot
   * disagree; fall back to the last turn's runtime when the service is unavailable. */
  HeaderTools.prototype.contextUse = function () {
    var ca = this.svc('contextAdmit', 'PMXContextAdmit');
    if (ca && typeof ca.receipt === 'function') {
      try {
        var r = ca.receipt(this.tid());
        if (r && r.pressure && r.pressure.limit) {
          return { used: r.pressure.used, limit: r.pressure.limit, ratio: r.pressure.ratio, runtime: {} };
        }
      } catch (e) {}
    }
    var msgs = this.ctx.data.messagesFor(this.tid()) || [];
    var last = msgs[msgs.length - 1];
    var rt = last && last.runtime ? last.runtime : {};
    var used = rt.contextUsed || 0, limit = rt.contextLimit || 128000;
    return { used: used, limit: limit, ratio: Math.max(0, Math.min(1, used / limit)), runtime: rt };
  };

  /* ------------------------------------------------------------------ Context ring */

  HeaderTools.prototype.openRing = function (anchor) {
    var self = this;
    var u = U();
    var ca = this.svc('contextAdmit', 'PMXContextAdmit');

    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'panel', width: 320,
      build: function (host, api) {
        function render() {
          u.empty(host);
          host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Context admission' }));

          var rec = ca ? ca.receipt(self.tid()) : null;
          if (!rec) {
            host.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No admission receipt is available.' }));
            return;
          }

          /* Pressure as a bar plus the two numbers. A bar alone hides how much headroom is
           * left in absolute terms, which is the number that decides whether to compact. */
          var bar = u.el('div', { class: 'pmx-ctx-bar' });
          var fill = u.el('div', { class: 'pmx-ctx-bar-fill' });
          fill.style.width = Math.round(rec.pressure.ratio * 100) + '%';
          bar.appendChild(fill);
          host.appendChild(bar);
          host.appendChild(u.el('div', {
            class: 'pmx-ctx-pressure',
            text: rec.pressure.used.toLocaleString() + ' of ' + rec.pressure.limit.toLocaleString() + ' tokens admitted'
          }));
          host.appendChild(u.el('div', {
            class: 'pmx-ctx-cache',
            text: 'Prompt cache is ' + rec.cache.state
          }));

          host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Included' }));
          rec.included.forEach(function (row) {
            var r = u.el('div', { class: 'pmx-ctx-row' }, [
              u.el('span', { class: 'pmx-ctx-row-label', text: row.label }),
              u.el('span', { class: 'pmx-ctx-row-prov', text: row.provenance || '' })
            ]);
            if (row.removable) {
              var rm = u.el('button', { class: 'pmx-ctx-remove', type: 'button', text: 'Remove' });
              u.on(rm, 'click', function () {
                ca.removeAdmitted(self.tid(), row.id);
                render();
                api.resize();
              });
              r.appendChild(rm);
            }
            host.appendChild(r);
          });

          host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Left out' }));
          rec.omitted.forEach(function (row) {
            host.appendChild(u.el('div', { class: 'pmx-ctx-row', data: { omitted: '1' } }, [
              u.el('span', { class: 'pmx-ctx-row-label', text: row.label }),
              u.el('span', { class: 'pmx-ctx-row-prov', text: row.reason || '' })
            ]));
          });

          /* The compaction receipt persists, so a user who compacted five minutes ago can still
           * see what it cost them. */
          var prior = ca.compactReceipt ? ca.compactReceipt(self.tid()) : null;
          if (prior) {
            host.appendChild(u.el('div', {
              class: 'pmx-ctx-receipt',
              text: 'Compacted ' + prior.before.toLocaleString() + ' to ' + prior.after.toLocaleString() +
                    ' tokens · ancestry preserved'
            }));
          }

          var acts = u.el('div', { class: 'pmx-chrome-ctx-acts' });
          var compact = u.el('button', { class: 'pmx-pop-action', text: 'Compact now' });
          u.on(compact, 'click', function () {
            var opId = ca.compactNow(self.tid());
            var obs = self.svc('observable', 'PMXObservable');
            var op = obs && opId ? obs.get(opId) : null;
            /* Show the operation, then its receipt. The button is not a fire-and-forget: the
             * whole point of routing through ObservableWork is that the work is visible. */
            compact.disabled = true;
            compact.textContent = op && op.state === 'complete' ? 'Compacted' : 'Compacting…';
            if (op) compact.setAttribute('data-pmx-op', op.id);
            render();
            api.resize();
          });
          acts.appendChild(compact);

          /* D7: this used to open `context-detail`, an id that is not in the artifact catalog,
           * so it fell through to a legacy editor tab instead of the left artifact workspace.
           * `artifact-context` is a real catalog record holding this receipt. */
          var details = u.el('button', { class: 'pmx-pop-action', text: 'More details' });
          u.on(details, 'click', function () {
            self.ctx.services.artifacts.open('artifact-context');
            api.close();
          });
          acts.appendChild(details);
          host.appendChild(acts);
        }
        render();
      }
    });
  };

  /* ------------------------------------------------------------------ Prior chats */

  HeaderTools.prototype.openPriorChats = function (anchor) {
    var self = this;
    var u = U();
    var ca = this.svc('contextAdmit', 'PMXContextAdmit');
    var ops = this.svc('threadOps', 'PMXThreadOps');

    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 340,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Prior chats' }));
        var input = u.el('input', {
          class: 'pmx-popup-search', type: 'search',
          placeholder: 'Search earlier conversations', aria: { label: 'Search earlier conversations' }
        });
        host.appendChild(input);
        var list = u.el('div', { class: 'pmx-popup-scroll pmx-scroll' });
        host.appendChild(list);

        function render() {
          u.empty(list);
          var q = input.value.trim();
          if (!q) {
            list.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'Search to find a passage in an earlier conversation.' }));
            api.resize();
            return;
          }
          var hits = ca ? ca.priorChats(q) : [];
          if (!hits.length) {
            list.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No earlier conversation matches that.' }));
            api.resize();
            return;
          }
          hits.slice(0, 12).forEach(function (hit) {
            var row = u.el('div', { class: 'pmx-prior-row' }, [
              u.el('div', { class: 'pmx-prior-title', text: hit.threadTitle }),
              u.el('div', { class: 'pmx-prior-passage', text: hit.passage })
            ]);
            var acts = u.el('div', { class: 'pmx-prior-acts' });

            /* Four verbatim actions (02_...:51-56). Each one does a different real thing —
             * that is why they are four and not one "Use this". */
            function act(label, fn) {
              var b = u.el('button', { class: 'pmx-prior-act', type: 'button', text: label });
              u.on(b, 'click', function () { fn(); });
              acts.appendChild(b);
            }
            act('Open conversation', function () {
              self.ctx.store.set('session.activeThreadId', hit.threadId);
              api.close();
            });
            act('Add passage to context', function () {
              /* Only the selected passage enters context — never the whole conversation. */
              if (ca) ca.addPassage(self.tid(), hit);
              api.close();
            });
            act('Branch from this point', function () {
              if (ops) ops.branch({ threadId: hit.threadId, messageId: hit.messageId });
              api.close();
            });
            act('Copy link', function () {
              var link = '#thread=' + hit.threadId + '&message=' + hit.messageId;
              var toast = self.svc('toast', 'PMXToast');
              if (global.navigator && global.navigator.clipboard) {
                try { global.navigator.clipboard.writeText(link); } catch (e) {}
              }
              if (toast) toast.show('Link copied · ' + link);
            });
            row.appendChild(acts);
            list.appendChild(row);
          });
          api.resize();
        }

        u.on(input, 'input', render);
        render();
        setTimeout(function () { try { input.focus(); } catch (e) {} }, 30);
      }
    });
  };

  /* ------------------------------------------------------------------ Environment */

  HeaderTools.prototype.openEnvironment = function (anchor) {
    var self = this;
    var u = U();
    var ops = this.svc('ops', 'PMXOps');

    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'panel', width: 340,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Environment' }));
        if (!ops) {
          host.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'Environment information is unavailable.' }));
          return;
        }

        function group(title, rows) {
          host.appendChild(u.el('div', { class: 'pmx-popup-group', text: title }));
          if (!rows.length) {
            host.appendChild(u.el('div', { class: 'pmx-env-none', text: 'Nothing to report.' }));
            return;
          }
          rows.forEach(function (pair) {
            host.appendChild(u.el('div', { class: 'pmx-env-row' }, [
              u.el('span', { class: 'pmx-env-key', text: pair[0] }),
              u.el('span', { class: 'pmx-env-val', text: pair[1] })
            ]));
          });
        }

        /* Six compact groups, in the order the plan fixes. Each is a summary, never a log. */
        var conflicts = ops.conflicts(self.tid()) || [];
        group('Threads and Goals', conflicts.length
          ? conflicts.map(function (c) { return [c.kind === 'port' ? 'Port' : c.kind, c.summary]; })
          : [['Conflicts', 'None affecting this thread']]);

        group('Worktrees and leases', (ops.worktrees() || []).map(function (w) {
          return [w.branch || w.id, w.state];
        }));

        group('Ports and services', (ops.ports() || []).map(function (p) {
          return ['Port ' + p.port, p.service + (p.suggestedAlternative ? ' · try ' + p.suggestedAlternative : '')];
        }));

        group('Sessions', (ops.sessions() || []).map(function (s) {
          return [s.kind || s.id, s.label || s.state || ''];
        }));

        var pressure = ops.pressure() || {};
        var allowance = ops.allowance() || {};
        function pct(v) { return Math.round((v || 0) * 100) + '%'; }
        group('Pressure and allowance', [
          ['Processor', pct(pressure.cpu)],
          ['Memory', pct(pressure.memory)],
          ['Disk', pct(pressure.disk)],
          ['Graphics', pct(pressure.gpu)],
          ['Provider allowance', (allowance.used || 0) + ' of ' + (allowance.limit || 0) +
            (allowance.cooldownSeconds ? ' · cooling down' : '')]
        ]);

        var rec = ops.recovery() || {};
        group('Recovery', [
          ['Logs', String((rec.logs || []).length)],
          ['Backups', String((rec.backups || []).length)],
          ['Snapshots', String((rec.snapshots || []).length)],
          ['Restore points', String((rec.restorePoints || []).length)]
        ]);

        /* The only action here, because requesting a worktree is the one operational thing Chat
         * legitimately initiates; everything else belongs to its owner. */
        var req = u.el('button', { class: 'pmx-pop-action', text: 'Request a new worktree' });
        u.on(req, 'click', function () {
          ops.requestWorktree(self.tid(), { reason: 'Requested from Chat' });
          api.close();
        });
        host.appendChild(req);
        api.resize();
      }
    });
  };

  /* ------------------------------------------------------------------ Sync state */

  HeaderTools.prototype.openSync = function (anchor) {
    var self = this;
    var u = U();
    var sync = this.svc('sync', 'PMXSync');

    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'panel', width: 300,
      build: function (host, api) {
        function render() {
          u.empty(host);
          host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Sync state' }));
          if (!sync) {
            host.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'Sync information is unavailable.' }));
            return;
          }

          /* Transport and domain are separate lines because they are separate axes: a live
           * connection can carry a degraded provider. */
          host.appendChild(u.el('div', { class: 'pmx-env-row' }, [
            u.el('span', { class: 'pmx-env-key', text: 'Connection' }),
            u.el('span', { class: 'pmx-env-val', text: sync.transport() })
          ]));
          host.appendChild(u.el('div', { class: 'pmx-env-row' }, [
            u.el('span', { class: 'pmx-env-key', text: 'Service' }),
            u.el('span', { class: 'pmx-env-val', text: sync.domain() })
          ]));

          var r = sync.route();
          [['Home Server', r.homeServer], ['Execution Host', r.executionHost],
           ['Environment', r.environment], ['Connection route', r.connectionRoute]]
            .forEach(function (pair) {
              host.appendChild(u.el('div', { class: 'pmx-env-row' }, [
                u.el('span', { class: 'pmx-env-key', text: pair[0] }),
                u.el('span', { class: 'pmx-env-val', text: pair[1] })
              ]));
            });

          var box = sync.outbox();
          host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Queued sends' }));
          if (!box.length) {
            host.appendChild(u.el('div', { class: 'pmx-env-none', text: 'Nothing queued.' }));
          } else {
            box.forEach(function (e) {
              var row = u.el('div', { class: 'pmx-env-row' }, [
                u.el('span', { class: 'pmx-env-key', text: e.commandId }),
                u.el('span', { class: 'pmx-env-val', text: e.status })
              ]);
              if (e.status !== 'sent') {
                var rm = u.el('button', { class: 'pmx-ctx-remove', type: 'button', text: 'Remove' });
                u.on(rm, 'click', function () { sync.remove(e.id); render(); api.resize(); });
                row.appendChild(rm);
              }
              host.appendChild(row);
            });
          }

          var work = sync.serverWork() || [];
          if (work.length) {
            host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Running on the server' }));
            work.forEach(function (w) {
              host.appendChild(u.el('div', { class: 'pmx-env-row' }, [
                u.el('span', { class: 'pmx-env-key', text: w.label }),
                u.el('span', { class: 'pmx-env-val', text: 'Continues when this client closes' })
              ]));
            });
          }

          var rc = u.el('button', { class: 'pmx-pop-action', text: 'Reconnect' });
          u.on(rc, 'click', function () {
            var opId = sync.reconnect();
            if (opId) rc.setAttribute('data-pmx-op', opId);
            render();
            api.resize();
          });
          host.appendChild(rc);
        }
        render();
      }
    });
  };

  /* ------------------------------------------------------------------ Context Lens */

  HeaderTools.prototype.openLens = function (anchor) {
    var self = this;
    var u = U();
    var lens = this.ctx.services.lens;
    var tid = this.tid();

    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 250,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Context Lens' }));
        [['mute', 'Mute', 'Excluded from what the agent reads'],
         ['focus', 'Focus', 'Prioritised for the agent'],
         ['subcompact', 'Subcompact', 'Replaced by a local summary'],
         ['off', 'Turn Off', 'Leave selection mode']].forEach(function (m) {
          var cur = lens.mode(tid) === m[0];
          var row = u.el('button', { class: 'pmx-popup-item', aria: { checked: cur ? 'true' : 'false' } }, [
            u.el('span', { class: 'pmx-popup-item-label' }, [
              u.el('span', { text: m[1] }),
              u.el('span', { class: 'pmx-chrome-lens-desc', text: m[2] })
            ])
          ]);
          if (cur) row.appendChild(self.ctx.services.icons.get('check', 13));
          u.on(row, 'click', function () {
            lens.setMode(tid, m[0]);
            self.syncLens();
            if (m[0] === 'off') api.close();
            else api.resize();
          });
          host.appendChild(row);
        });

        /* Subcompact is the only mode with an explicit Apply, and the only one bounded per
         * operation. The budget is shown so the limit is never a surprise. */
        if (lens.mode(tid) === 'subcompact') {
          var sel = lens.selection(tid).length;
          host.appendChild(u.el('div', { class: 'pmx-chrome-lens-budget',
            text: sel + ' selected. One operation covers up to ' + lens.MAX_PER_APPLY + '.' }));
          var apply = u.el('button', { class: 'pmx-pop-action', text: 'Apply Subcompact' });
          u.on(apply, 'click', function () {
            var res = lens.apply(tid);
            self.ctx.services.toast.show(res.ok ? 'Subcompact applied' : res.reason);
            self.syncLens();
            api.close();
          });
          host.appendChild(apply);
        }

        /* The Lens shapes what is admitted; the receipt is where you read the result. Linking
         * them here is what makes the pair one idea instead of two unrelated popups
         * (02_CONTEXT_HISTORY_THREADS_AND_BRANCHING.md:16). */
        var admit = u.el('button', { class: 'pmx-pop-action', text: 'Context Lens admission view' });
        u.on(admit, 'click', function () { api.close(); self.openRing(self.ringBtn); });
        host.appendChild(admit);
      }
    });
  };

  /* ------------------------------------------------------------------ More options */

  HeaderTools.prototype.openMore = function (anchor) {
    var self = this;
    var u = U();
    var ops = this.svc('threadOps', 'PMXThreadOps');
    var obs = this.svc('observable', 'PMXObservable');
    var toast = this.svc('toast', 'PMXToast');
    var spell = this.svc('spell', 'PMXSpell');
    var folded = this.isFolded();

    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 260,
      build: function (host, api) {
        function item(label, fn, hint) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: label })
          ]);
          if (hint) row.appendChild(u.el('span', { class: 'pmx-popup-item-hint', text: hint }));
          u.on(row, 'click', function () { api.close(); fn(); });
          host.appendChild(row);
        }

        /* At narrow widths the three folded chips reappear here first, so nothing is lost by
         * the collapse — it is a fold, not a removal. */
        if (folded) {
          host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Folded controls' }));
          item('Prior chats…', function () { self.openPriorChats(anchor); });
          item('Environment…', function () { self.openEnvironment(anchor); });
          item('Sync state…', function () { self.openSync(anchor); });
        }

        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Thread' }));

        item('Duplicate thread', function () {
          var rec = ops && ops.spawn({ parentThreadId: self.tid(), relation: 'sibling', task: 'Duplicate of this thread' });
          if (toast) toast.show(rec ? 'Duplicated as a sibling thread' : 'Could not duplicate this thread');
        });

        item('Rename thread', function () { self.beginRename(); });

        item('Archive thread', function () {
          var t = self.ctx.data.threadById(self.tid());
          if (t) { t.archived = !t.archived; self.ctx.store.touchView('threadHistory'); }
          if (toast) toast.show(t && t.archived ? 'Thread archived' : 'Thread restored');
        });

        item('Export thread', function () {
          if (!obs) return;
          var op = obs.start({ id: 'export-' + self.tid(), kind: 'export', label: 'Exporting conversation', determinate: true, total: 2 });
          obs.step(op.id, 1, 'Collecting turns');
          obs.finish(op.id, { line: 'Exported as a document artifact' });
          self.ctx.services.artifacts.open('artifact-context');
        });

        item('Branch from here', function () {
          var msgs = self.ctx.data.messagesFor(self.tid()) || [];
          var last = msgs.length ? msgs[msgs.length - 1] : null;
          var rec = ops && ops.branch({ threadId: self.tid(), messageId: last ? last.id : null });
          if (toast) toast.show(rec ? 'Branched from the latest turn' : 'Could not branch this thread');
        });

        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'History' }));

        item('Create restore point', function () {
          var msgs = self.ctx.data.messagesFor(self.tid()) || [];
          var last = msgs.length ? msgs[msgs.length - 1] : null;
          var rp = ops && ops.createRestorePoint(self.tid(), last ? last.id : null);
          if (toast) toast.show(rp ? 'Restore point created' : 'Could not create a restore point');
        });

        item('Rewind to here…', function () {
          var msgs = self.ctx.data.messagesFor(self.tid()) || [];
          var last = msgs.length ? msgs[msgs.length - 1] : null;
          var res = ops && ops.rewind(self.tid(), last ? last.id : null);
          /* A rewind always leaves a restore point behind, so the toast names it: an
           * irreversible rewind would be data loss. */
          if (toast) toast.show(res && res.ok ? 'Rewound · restore point kept' : 'Could not rewind');
        });

        item('Send request to another thread…', function () { self.openRequestPicker(anchor); });

        item('Spawn research thread', function () {
          var rec = ops && ops.spawn({ parentThreadId: self.tid(), relation: 'child', task: 'Research the open questions in this thread' });
          if (toast) toast.show(rec ? 'Research thread spawned' : 'Could not spawn a child thread');
        });

        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: 'Composer' }));

        /* The ONLY place this control exists. It is deliberately quiet: passive spellcheck is
         * the default, and a toolbar button for it would advertise a setting nobody needs to
         * touch (06_COMPOSER_SPELLCHECK_AND_THREAD_LOCAL_STATE.md:32). */
        var enabled = spell && spell.enabledFor(self.tid());
        item(enabled ? 'Disable spell check in this thread' : 'Enable spell check in this thread', function () {
          if (spell) spell.setEnabledFor(self.tid(), !enabled);
          self.ctx.store.touchView('draft');
        });
      }
    });
  };

  /* Inline rename against the thread record. Kept here rather than in a dialog because the
   * title is one short field and the surrounding header is the context that makes a good title
   * obvious. */
  HeaderTools.prototype.beginRename = function () {
    var self = this;
    var u = U();
    var t = this.ctx.data.threadById(this.tid());
    if (!t) return false;
    this.ctx.services.popup.open({
      anchorEl: this.moreBtn, kind: 'panel', width: 280,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Rename thread' }));
        var input = u.el('input', { class: 'pmx-popup-search', value: t.title, aria: { label: 'Thread title' } });
        host.appendChild(input);
        var save = u.el('button', { class: 'pmx-pop-action', text: 'Rename' });
        u.on(save, 'click', function () {
          var next = String(input.value || '').trim();
          if (next) { t.title = next; self.ctx.store.touchView('threadHistory'); }
          api.close();
        });
        host.appendChild(save);
        setTimeout(function () { try { input.focus(); input.select(); } catch (e) {} }, 30);
      }
    });
    return true;
  };

  /* Cross-thread request. The target list is thread SHELLS — a picker that hydrated every
   * candidate conversation would be the exact cost the shell projection exists to avoid. */
  HeaderTools.prototype.openRequestPicker = function (anchor) {
    var self = this;
    var u = U();
    var ops = this.svc('threadOps', 'PMXThreadOps');
    if (!ops) return null;

    return this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'list', width: 300,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Send request to another thread' }));
        var related = ops.related(self.tid()) || [];
        if (!related.length) {
          host.appendChild(u.el('div', { class: 'pmx-pop-empty', text: 'No other thread is available.' }));
          return;
        }
        related.slice(0, 12).forEach(function (shell) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: shell.title }),
            u.el('span', { class: 'pmx-popup-item-hint', text: shell.state || '' })
          ]);
          u.on(row, 'click', function () {
            var rec = ops.request({
              sourceThreadId: self.tid(), targetThreadId: shell.id,
              task: 'Answer the open question from this thread',
              scope: 'read-only', budget: { turns: 2, seconds: 120 }
            });
            var toast = self.svc('toast', 'PMXToast');
            /* A refusal is reported with its reason, never swallowed. */
            if (toast) toast.show(rec && rec.reason ? rec.reason : 'Request sent to ' + shell.title);
            api.close();
          });
          host.appendChild(row);
        });
      }
    });
  };

  /* ------------------------------------------------------------------ sync */

  HeaderTools.prototype.isFolded = function () {
    var w = this.ctx.store.get('ui.chatWidth');
    return typeof w === 'number' && w < FOLD_WIDTH;
  };

  HeaderTools.prototype.syncLens = function () {
    var m = this.ctx.services.lens.mode(this.tid());
    this.lensBtn.setAttribute('data-lens-mode', m);
    this.lensBtn.setAttribute('aria-pressed', m && m !== 'off' ? 'true' : 'false');
  };

  /* The fold is declarative: one attribute on the root, three CSS rules, no measurement. The
   * chips stay in the DOM so the More popup can reopen them at the same anchor. */
  HeaderTools.prototype.syncChips = function () {
    var folded = this.isFolded();
    this.root.setAttribute('data-pmx-folded', folded ? '1' : '0');

    var sync = this.svc('sync', 'PMXSync');
    if (sync) {
      var transport = sync.transport();
      var domain = sync.domain();
      this.syncBtn.setAttribute('data-pmx-transport', transport);
      this.syncBtn.setAttribute('data-pmx-domain', domain);
      this.syncBtn.title = 'Connection ' + transport + ' · Service ' + domain;
      var box = sync.outbox().filter(function (e) { return e.status !== 'sent'; });
      this.syncBtn.setAttribute('data-pmx-queued', box.length ? String(box.length) : '');
    }

    var ops = this.svc('ops', 'PMXOps');
    if (ops) {
      var conflicts = ops.conflicts(this.tid()) || [];
      /* The chip only claims attention when something is actionable. An environment chip that
       * always looks urgent is an environment chip nobody reads. */
      this.envBtn.setAttribute('data-pmx-conflicts', conflicts.length ? String(conflicts.length) : '');
    }

    var ring = this.root.querySelector('.pmx-chrome-ring');
    if (ring) {
      U().empty(ring);
      ring.appendChild(this.buildRing());
    }
  };

  HeaderTools.prototype.update = function (state, changed) {
    if (this.selectors) this.selectors.update(state, changed);
    for (var i = 0; i < changed.length; i++) {
      var k = String(changed[i]);
      if (k.indexOf('view') === 0 || k.indexOf('session') === 0 || k.indexOf('ui') === 0) {
        this.syncLens();
        this.syncChips();
        return;
      }
    }
  };

  HeaderTools.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.selectors) { try { this.selectors.destroy(); } catch (e) {} this.selectors = null; }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  global.PMXHeaderTools = {
    mount: function (host, ctx) { return new HeaderTools(host, ctx); },
    FOLD_WIDTH: FOLD_WIDTH
  };
})(window);
