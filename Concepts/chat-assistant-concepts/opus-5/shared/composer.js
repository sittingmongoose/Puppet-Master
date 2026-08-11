/* PMX composer — Opus 5
 *
 * Mounted into whatever region the window concept designates, so behavior is identical
 * across all eight window concepts while placement varies.
 *
 * Locked contracts implemented here:
 *  - Send / Stop state machine:
 *      active agent + empty composer      -> Stop
 *      active agent + user begins typing  -> Send
 *      draft cleared while agent active   -> Stop
 *      agent no longer active             -> Send
 *    Pressing Send while an agent is working is NEVER interpreted as Stop.
 *    Stop is not duplicated under individual messages.
 *  - Platform spellcheck enabled, custom visual treatment retained.
 *  - Per-thread durable draft with attachments and bounded revision history.
 *  - The ordinary composer is UNAVAILABLE while a questionnaire is active.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  function Composer(hostEl, ctx) {
    this.host = hostEl;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  Composer.prototype._on = function (el, ev, fn) {
    this.offs.push(U().on(el, ev, fn));
  };

  Composer.prototype.build = function () {
    var self = this;
    var ctx = this.ctx;
    var svc = ctx.services;

    this.root = U().el('div', { class: 'pmx-composer', data: { pmxComposer: '1' } });

    /* One surface. The box carries the border, the radius and the focus ring;
     * the textarea inside it is borderless and transparent. Attach and send
     * live INSIDE this box rather than in a row beneath it, so the whole
     * composer reads as a single field you type into and act from — which is
     * what the selector row below it is measured against. */
    this.box = U().el('div', { class: 'pmx-composer-box' });
    this.root.appendChild(this.box);

    /* Attachment chips sit above the field, inside the same box. */
    this.chips = U().el('div', { class: 'pmx-composer-chips' });
    this.box.appendChild(this.chips);

    this.field = U().el('textarea', {
      class: 'pmx-composer-field pmx-scroll',
      aria: { label: 'Message' }
    });
    /* Platform spellcheck on, Puppet Master visual treatment retained via CSS. */
    this.field.setAttribute('spellcheck', 'true');
    this.field.setAttribute('autocapitalize', 'sentences');
    this.field.setAttribute('autocorrect', 'on');
    this.field.setAttribute('rows', '1');
    this.field.placeholder = 'Send a message';
    this.box.appendChild(this.field);

    var foot = U().el('div', { class: 'pmx-composer-foot' });

    this.attachBtn = U().el('button', { class: 'pmx-composer-icon', aria: { label: 'Attach' } });
    this.attachBtn.title = 'Attach';
    this.attachBtn.appendChild(svc.icons.get('attach', 15));
    foot.appendChild(this.attachBtn);

    this.spacer = U().el('span', { class: 'pmx-composer-spacer' });
    foot.appendChild(this.spacer);

    /* One button, two states. Never two buttons — that is how Send-means-Stop bugs happen. */
    this.sendBtn = U().el('button', { class: 'pmx-composer-send', data: { pmxState: 'send' } });
    foot.appendChild(this.sendBtn);

    this.box.appendChild(foot);

    /* Shown in place of the field while a questionnaire holds the floor. */
    this.lockNotice = U().el('div', { class: 'pmx-composer-locked' }, [
      U().el('span', { text: 'Answer the question above to continue the conversation.' })
    ]);
    this.root.appendChild(this.lockNotice);

    this.host.appendChild(this.root);

    this._on(this.field, 'input', function () { self.onInput(); });
    this._on(this.field, 'keydown', function (e) { self.onKeyDown(e); });
    this._on(this.sendBtn, 'click', function () { self.onSendOrStop(); });
    this._on(this.attachBtn, 'click', function () { self.onAttach(); });

    this._tickOff = svc.runtime.onTick(function () { self.syncButton(); });

    this.syncAll();
  };

  Composer.prototype.tid = function () {
    return this.ctx.store.get('session.activeThreadId');
  };

  Composer.prototype.onInput = function () {
    var tid = this.tid();
    this.ctx.services.drafts.setText(tid, this.field.value);
    this.autoGrow();
    /* The state machine depends on draft emptiness, so re-evaluate on every keystroke. */
    this.syncButton();
  };

  Composer.prototype.onKeyDown = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.onSendOrStop();
    }
  };

  Composer.prototype.autoGrow = function () {
    this.field.style.height = 'auto';
    var max = 160;
    this.field.style.height = Math.min(this.field.scrollHeight, max) + 'px';
  };

  Composer.prototype.onSendOrStop = function () {
    var tid = this.tid();
    var svc = this.ctx.services;
    if (svc.questionnaire.isComposerLocked(tid)) return;

    var state = svc.runtime.composerButtonState(tid, this.field.value);

    if (state === 'stop') {
      svc.runtime.stop(tid);
      this.syncButton();
      return;
    }

    var text = this.field.value;
    if (!text || !text.trim()) return;

    /* Sending while an agent works is a SEND, routed through steering, never a stop. */
    svc.drafts.archiveOnSend(tid);
    this.field.value = '';
    this.autoGrow();
    svc.runtime.send(tid, text);
    this.syncAll();
  };

  Composer.prototype.onAttach = function () {
    var tid = this.tid();
    var n = (this.ctx.services.drafts.get(tid).attachments || []).length + 1;
    this.ctx.services.drafts.addAttachment(tid, 'screenshots/attachment-' + n + '.png');
    this.syncChips();
  };

  Composer.prototype.syncButton = function () {
    var tid = this.tid();
    var svc = this.ctx.services;
    var state = svc.runtime.composerButtonState(tid, this.field.value);
    if (this.sendBtn.getAttribute('data-pmx-state') === state && this._builtBtn) return;
    this._builtBtn = true;
    this.sendBtn.setAttribute('data-pmx-state', state);
    U().empty(this.sendBtn);
    if (state === 'stop') {
      this.sendBtn.appendChild(svc.icons.get('stop', 15));
      this.sendBtn.setAttribute('aria-label', 'Stop');
      this.sendBtn.title = 'Stop';
    } else {
      this.sendBtn.appendChild(svc.icons.get('send', 15));
      this.sendBtn.setAttribute('aria-label', 'Send');
      this.sendBtn.title = 'Send';
    }
  };

  Composer.prototype.syncChips = function () {
    var self = this;
    var tid = this.tid();
    var svc = this.ctx.services;
    var atts = svc.drafts.get(tid).attachments || [];
    U().empty(this.chips);
    this.chips.style.display = atts.length ? '' : 'none';
    atts.forEach(function (path) {
      var chip = U().el('span', { class: 'pmx-composer-chip' }, [
        svc.icons.get('file', 12),
        U().el('span', { text: path.split('/').pop() })
      ]);
      var x = U().el('button', { class: 'pmx-composer-chip-x', aria: { label: 'Remove attachment' } });
      x.appendChild(svc.icons.get('close', 10));
      U().on(x, 'click', function () {
        svc.drafts.removeAttachment(tid, path);
        self.syncChips();
      });
      chip.appendChild(x);
      self.chips.appendChild(chip);
    });
  };

  Composer.prototype.syncLock = function () {
    var tid = this.tid();
    var locked = this.ctx.services.questionnaire.isComposerLocked(tid);
    this.root.setAttribute('data-pmx-locked', locked ? '1' : '0');
    this.field.disabled = !!locked;
    this.sendBtn.disabled = !!locked;
    this.attachBtn.disabled = !!locked;
  };

  Composer.prototype.syncAll = function () {
    var tid = this.tid();
    var d = this.ctx.services.drafts.get(tid);
    if (this.field.value !== (d.text || '')) this.field.value = d.text || '';
    this.autoGrow();
    this.syncChips();
    this.syncLock();
    this.syncButton();
  };

  Composer.prototype.update = function (state, changed) {
    var relevant = changed.some(function (k) {
      return k.indexOf('view') === 0 || k === 'session.activeThreadId' || k.indexOf('session') === 0;
    });
    if (relevant) this.syncAll();
  };

  Composer.prototype.destroy = function () {
    for (var i = 0; i < this.offs.length; i++) { try { this.offs[i](); } catch (e) {} }
    this.offs = [];
    if (this._tickOff) { try { this._tickOff(); } catch (e) {} this._tickOff = null; }
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  };

  global.PMXComposer = {
    mount: function (hostEl, ctx) { return new Composer(hostEl, ctx); }
  };
})(window);
