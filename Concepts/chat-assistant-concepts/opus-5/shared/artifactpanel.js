/* PMX artifact panel — Opus 5
 * Global: window.PMXArtifactPanel
 *
 * Renders the BODY of the active artifact and its loading / ready / updating / error states.
 * It does not decide where it lives, how wide it is, or how you switch between artifacts —
 * those are the window concept's, and are what differentiate the eight placements. A window
 * mounts this into whatever element it designates as `artifactHost`.
 *
 * The panel owns its own scroller, independent of the transcript, and restores the per-artifact
 * scroll position on switch (PMXArtifacts.scrollTop is the store-backed record).
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  function Panel(host, ctx) {
    this.host = host;
    this.ctx = ctx;
    this.offs = [];
    this.lastId = null;
    this.build();
  }

  Panel.prototype._on = function (el, ev, fn) { this.offs.push(U().on(el, ev, fn)); };

  Panel.prototype.build = function () {
    var u = U(), self = this;
    this.root = u.el('div', { class: 'pmx-artifact', data: { pmxArtifact: '1' } });

    this.head = u.el('div', { class: 'pmx-artifact-head' });
    this.titleEl = u.el('span', { class: 'pmx-artifact-title' });
    this.subEl = u.el('span', { class: 'pmx-artifact-sub' });
    var titles = u.el('div', { class: 'pmx-artifact-titles' }, [this.titleEl, this.subEl]);
    this.head.appendChild(titles);

    this.closeBtn = u.el('button', {
      class: 'pmx-artifact-close', type: 'button', aria: { label: 'Close artifact workspace' }
    });
    this.closeBtn.appendChild(this.ctx.services.icons.get('close', 13));
    this._on(this.closeBtn, 'click', function () { global.PMXArtifacts.close(); });
    this.head.appendChild(this.closeBtn);
    this.root.appendChild(this.head);

    this.body = u.el('div', { class: 'pmx-artifact-body pmx-scroll' });
    this.root.appendChild(this.body);

    /* Persist the scroll offset per artifact so switching away and back returns you to where
     * you were reading, rather than to the top of a document you were halfway through. */
    this._on(this.body, 'scroll', U().throttle(function () {
      var id = global.PMXArtifacts.activeId();
      if (id) global.PMXArtifacts.scrollTop(id, self.body.scrollTop);
    }, 200));

    this.host.appendChild(this.root);

    this._unsub = global.PMXArtifacts.subscribe(function () { self.render(); });
    this.render();
  };

  Panel.prototype.render = function () {
    var u = U(), self = this;
    var A = global.PMXArtifacts;
    var id = A.activeId();
    var def = id ? A.get(id) : null;

    this.root.setAttribute('data-open', A.isOpen() ? '1' : '0');
    if (!def) {
      this.titleEl.textContent = 'No artifact open';
      this.subEl.textContent = '';
      u.empty(this.body);
      return;
    }

    var state = A.stateOf(id);
    this.root.setAttribute('data-state', state);
    this.titleEl.textContent = def.title;
    this.subEl.textContent = def.subtitle || '';

    u.empty(this.body);

    if (state === 'loading') { this.body.appendChild(this.skeleton()); return; }
    if (state === 'error') { this.body.appendChild(this.errorBlock(id, A.errorOf(id))); return; }

    /* `updating` deliberately keeps the previous body on screen and only marks the surface, so
     * an in-place count change reads as a change rather than as a reload. */
    this.body.appendChild(this.bodyFor(def));

    var want = A.scrollTop(id);
    if (this.lastId !== id) {
      this.lastId = id;
      /* Restore after layout, or the scroller has no height yet and the assignment is dropped. */
      global.requestAnimationFrame(function () { self.body.scrollTop = want || 0; });
    }
  };

  Panel.prototype.skeleton = function () {
    var u = U();
    var wrap = u.el('div', { class: 'pmx-artifact-skeleton', aria: { live: 'polite', label: 'Loading artifact' } });
    for (var i = 0; i < 5; i++) {
      wrap.appendChild(u.el('div', { class: 'pmx-artifact-skel-row', data: { i: String(i) } }));
    }
    wrap.appendChild(u.el('div', { class: 'pmx-artifact-skel-note', text: 'Loading' }));
    return wrap;
  };

  Panel.prototype.errorBlock = function (id, message) {
    var u = U(), self = this;
    var wrap = u.el('div', { class: 'pmx-artifact-error', aria: { live: 'polite' } });
    wrap.appendChild(u.el('div', { class: 'pmx-artifact-error-title', text: 'This artifact could not be opened' }));
    wrap.appendChild(u.el('div', {
      class: 'pmx-artifact-error-body',
      text: message || 'The artifact record could not be read.'
    }));
    /* A record-backed degrade, not a claim that the artifact is gone: the index is a projection
     * and a missing row means the lookup failed, not that the object was lost. */
    wrap.appendChild(u.el('div', {
      class: 'pmx-artifact-error-note',
      text: 'The artifact record itself is intact. Only the preview lookup failed.'
    }));
    var retry = u.el('button', { class: 'pmx-artifact-retry', type: 'button', text: 'Try again' });
    this._on(retry, 'click', function () { global.PMXArtifacts.retry(id); });
    wrap.appendChild(retry);
    return wrap;
  };

  Panel.prototype.bodyFor = function (def) {
    switch (def.kind) {
      case 'multi_file_diff': return this.renderDiff(def);
      case 'source': return this.renderSource(def);
      case 'image': return this.renderImage(def);
      case 'test_report': return this.renderReport(def);
      default: return this.renderDocument(def);
    }
  };

  Panel.prototype.renderDiff = function (def) {
    var u = U();
    var wrap = u.el('div', { class: 'pmx-artifact-diff' });
    (def.files || []).forEach(function (f) {
      var row = u.el('div', { class: 'pmx-artifact-diff-row', data: { status: f.status } });
      row.appendChild(u.el('span', { class: 'pmx-artifact-diff-path', text: f.path }));
      var counts = u.el('span', { class: 'pmx-artifact-diff-counts' });
      /* Additions and deletions are aligned right and carry a sign, so the pair reads as a
       * measurement rather than as two coloured words. Colour is not the only signal. */
      counts.appendChild(u.el('span', { class: 'pmx-artifact-add', text: '+' + f.additions }));
      counts.appendChild(u.el('span', { class: 'pmx-artifact-del', text: '−' + f.deletions }));
      row.appendChild(counts);
      wrap.appendChild(row);
    });
    return wrap;
  };

  Panel.prototype.renderSource = function (def) {
    var u = U();
    var wrap = u.el('pre', { class: 'pmx-artifact-source' });
    (def.lines || []).forEach(function (l) {
      var line = u.el('div', { class: 'pmx-artifact-line', data: { hot: l.hot ? '1' : '0' } });
      line.appendChild(u.el('span', { class: 'pmx-artifact-ln', text: String(l.n) }));
      line.appendChild(u.el('span', { class: 'pmx-artifact-code', text: l.text }));
      wrap.appendChild(line);
    });
    return wrap;
  };

  /* An inline SVG rather than a binary: the workspace has to run from disk with no assets, and
   * a missing-image request is exactly the kind of failure the probes forbid. */
  Panel.prototype.renderImage = function (def) {
    var u = U();
    var wrap = u.el('div', { class: 'pmx-artifact-image' });
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 320 200');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Captured preview of the provider selector');
    svg.setAttribute('class', 'pmx-artifact-shot');
    function rect(x, y, w, h, cls) {
      var r = document.createElementNS(svgNS, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', y);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.setAttribute('rx', '3'); r.setAttribute('class', cls);
      svg.appendChild(r);
    }
    rect(0, 0, 320, 200, 'pmx-shot-bg');
    rect(12, 12, 120, 14, 'pmx-shot-line');
    rect(12, 36, 296, 40, 'pmx-shot-panel');
    rect(20, 46, 80, 8, 'pmx-shot-line');
    rect(20, 60, 140, 8, 'pmx-shot-dim');
    rect(12, 86, 296, 40, 'pmx-shot-panel');
    rect(20, 96, 96, 8, 'pmx-shot-line');
    rect(20, 110, 120, 8, 'pmx-shot-dim');
    rect(12, 136, 296, 40, 'pmx-shot-panel-active');
    rect(20, 146, 110, 8, 'pmx-shot-line');
    rect(20, 160, 88, 8, 'pmx-shot-dim');
    wrap.appendChild(svg);
    wrap.appendChild(u.el('div', { class: 'pmx-artifact-caption', text: def.projectPath }));
    return wrap;
  };

  Panel.prototype.renderReport = function (def) {
    var u = U();
    var wrap = u.el('div', { class: 'pmx-artifact-report' });
    (def.rows || []).forEach(function (r) {
      var row = u.el('div', { class: 'pmx-artifact-report-row', data: { result: r.result } });
      var mark = u.el('span', { class: 'pmx-artifact-report-mark' });
      /* The result is a named glyph plus a word, never colour alone. */
      mark.appendChild(global.PMXIcons.get(r.result === 'pass' ? 'check' : 'dot', 12));
      row.appendChild(mark);
      row.appendChild(u.el('span', { class: 'pmx-artifact-report-name', text: r.name }));
      row.appendChild(u.el('span', {
        class: 'pmx-artifact-report-result',
        text: r.result === 'pass' ? 'Passed' : (r.result === 'skipped' ? 'Skipped' : 'Failed')
      }));
      wrap.appendChild(row);
      if (r.note) wrap.appendChild(u.el('div', { class: 'pmx-artifact-report-note', text: r.note }));
    });
    return wrap;
  };

  Panel.prototype.renderDocument = function (def) {
    var u = U();
    var wrap = u.el('div', { class: 'pmx-artifact-doc' });
    (def.sections || []).forEach(function (s) {
      wrap.appendChild(u.el('h4', { class: 'pmx-artifact-doc-h', text: s.heading }));
      wrap.appendChild(u.el('p', { class: 'pmx-artifact-doc-p', text: s.body }));
    });
    return wrap;
  };

  Panel.prototype.update = function () { /* driven by the artifacts subscription, not the store */ };

  Panel.prototype.destroy = function () {
    if (this._unsub) { this._unsub(); this._unsub = null; }
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  global.PMXArtifactPanel = {
    mount: function (host, ctx) { return new Panel(host, ctx); }
  };
})(window);
