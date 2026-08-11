/* PMX header tools — Opus 5
 * Search, Context Lens, Context Ring entry point, more-options, plus the selector row.
 * Mounted into whatever region the window designates, so behavior is identical everywhere.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  function HeaderTools(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  HeaderTools.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  HeaderTools.prototype.build = function () {
    var self = this;
    var u = U();
    var icons = this.ctx.services.icons;

    this.root = u.el('div', { class: 'pmx-chrome pmx-chrome-header' });

    /* Exactly one search bar. There is no second Lens-specific search anywhere. */
    this.searchBtn = this.iconBtn('search', 'Search', function (ev) {
      self.ctx.services.search.openPopup(ev.currentTarget, self.ctx);
    });
    this.root.appendChild(this.searchBtn);

    this.lensBtn = this.iconBtn('lens', 'Context Lens', function (ev) { self.openLens(ev.currentTarget); });
    this.root.appendChild(this.lensBtn);

    this.ringBtn = u.el('button', { class: 'pmx-chrome-ring', aria: { label: 'Context use' } });
    this.ringBtn.title = 'Context use';
    this.ringBtn.appendChild(this.buildRing());
    this._on(this.ringBtn, 'click', function (ev) { self.openRing(ev.currentTarget); });
    this.root.appendChild(this.ringBtn);

    this.moreBtn = this.iconBtn('more', 'More options', function (ev) { self.openMore(ev.currentTarget); });
    this.root.appendChild(this.moreBtn);

    this.selHost = u.el('div', { class: 'pmx-chrome-selhost' });
    this.root.appendChild(this.selHost);

    this.host.appendChild(this.root);
    this.selectors = global.PMXSelectors.mount(this.selHost, this.ctx);
    this.syncLens();
  };

  HeaderTools.prototype.iconBtn = function (icon, label, fn) {
    var u = U();
    var b = u.el('button', { class: 'pmx-chrome-btn', aria: { label: label } });
    b.title = label;
    b.appendChild(this.ctx.services.icons.get(icon, 15));
    this._on(b, 'click', fn);
    return b;
  };

  /* A small SVG gauge. The detailed dropdown and the Context Detail destination belong to
   * the parallel Usage redesign, so this is an entry point and a minimal status module —
   * deliberately not a replacement for internals someone else owns. */
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

  HeaderTools.prototype.contextUse = function () {
    var tid = this.ctx.store.get('session.activeThreadId');
    var msgs = this.ctx.data.messagesFor(tid) || [];
    var last = msgs[msgs.length - 1];
    var rt = last && last.runtime ? last.runtime : {};
    var used = rt.contextUsed || 0, limit = rt.contextLimit || 128000;
    return { used: used, limit: limit, ratio: Math.max(0, Math.min(1, used / limit)), runtime: rt };
  };

  HeaderTools.prototype.openRing = function (anchor) {
    var self = this;
    var u = U();
    var info = this.contextUse();
    var f = global.PMXData.fmt;
    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'panel', width: 250,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Context use' }));
        var rows = u.el('div', { class: 'pmx-chrome-ctx' });
        [['Used', info.used.toLocaleString() + ' of ' + info.limit.toLocaleString()],
         ['Input', (info.runtime.tokenCount || 0).toLocaleString()],
         ['Output', Math.round((info.runtime.tokenCount || 0) * 0.34).toLocaleString()],
         ['Estimated cost', f.cost(info.runtime.estimatedCost)]].forEach(function (r) {
          rows.appendChild(u.el('div', { class: 'pmx-chrome-ctx-row' }, [
            u.el('span', { text: r[0] }), u.el('span', { text: String(r[1]) })
          ]));
        });
        host.appendChild(rows);
        var acts = u.el('div', { class: 'pmx-chrome-ctx-acts' });
        var compact = u.el('button', { class: 'pmx-pop-action', text: 'Compact now' });
        u.on(compact, 'click', function () { self.ctx.services.toast.show('Compaction requested'); api.close(); });
        var details = u.el('button', { class: 'pmx-pop-action', text: 'More details' });
        u.on(details, 'click', function () {
          self.ctx.services.editorHost.openArtifact(
            { id: 'context-detail', title: 'Context detail', kind: 'context', projectPath: null }, self.ctx);
          api.close();
        });
        acts.appendChild(compact); acts.appendChild(details);
        host.appendChild(acts);
      }
    });
  };

  HeaderTools.prototype.openLens = function (anchor) {
    var self = this;
    var u = U();
    var lens = this.ctx.services.lens;
    var tid = this.ctx.store.get('session.activeThreadId');

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
      }
    });
  };

  HeaderTools.prototype.openMore = function (anchor) {
    var self = this;
    var u = U();
    this.ctx.services.popup.open({
      anchorEl: anchor, kind: 'menu', width: 200,
      build: function (host, api) {
        ['Duplicate thread', 'Rename thread', 'Archive thread', 'Export thread', 'Branch from here']
          .forEach(function (label) {
            var row = u.el('button', { class: 'pmx-popup-item' }, [
              u.el('span', { class: 'pmx-popup-item-label', text: label })
            ]);
            u.on(row, 'click', function () { self.ctx.services.toast.show(label); api.close(); });
            host.appendChild(row);
          });
      }
    });
  };

  HeaderTools.prototype.syncLens = function () {
    var tid = this.ctx.store.get('session.activeThreadId');
    var m = this.ctx.services.lens.mode(tid);
    this.lensBtn.setAttribute('data-lens-mode', m);
    this.lensBtn.setAttribute('aria-pressed', m && m !== 'off' ? 'true' : 'false');
  };

  HeaderTools.prototype.update = function (state, changed) {
    if (this.selectors) this.selectors.update(state, changed);
    for (var i = 0; i < changed.length; i++) {
      if (changed[i].indexOf('view') === 0 || changed[i].indexOf('session') === 0) { this.syncLens(); return; }
    }
  };

  HeaderTools.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.selectors) { try { this.selectors.destroy(); } catch (e) {} this.selectors = null; }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  global.PMXHeaderTools = {
    mount: function (host, ctx) { return new HeaderTools(host, ctx); }
  };
})(window);
