/* PMX composer — Opus 5
 *
 * Mounted into whatever region the window concept designates, so behaviour is identical
 * across all eight window concepts while placement varies.
 *
 * TEN STATES, ONE ATTRIBUTE
 * ------------------------
 * `data-pmx-cstate` on the root carries exactly one of:
 *   ordinary · long · attachments · question · redirect · offline-queued ·
 *   setup-required · cross-project · spell · disabled
 * (06_COMPOSER_SPELLCHECK_AND_THREAD_LOCAL_STATE.md:48-58). One attribute rather than a set of
 * booleans because the states are genuinely exclusive at the level the concept renders them,
 * and because a probe can then assert reachability by reading one value.
 *
 * THE QUESTION STATE DOES NOT LOCK THE COMPOSER
 * --------------------------------------------
 * The previous build disabled the field while a questionnaire held the floor. That is wrong and
 * it is the single most load-bearing correction in this file: the video-A principle requires the
 * composer to stay visible AND the draft to survive while questions are on screen, because a
 * user who was mid-sentence when the assistant asked something must not lose it. So `question`
 * only adds a hint line — `Answer the question above, or keep typing.` — and typing continues to
 * work.
 *
 * REDIRECT REPLACES STOP-IN-THE-MESSAGE-LIST
 * -----------------------------------------
 * While a turn is active the primary button becomes `Redirect` and dispatches a real redirect
 * through PMXThreadOps, preserving the interrupted attempt's partial output. `Stop` moves into
 * the overflow. There is no per-message Stop and no Resend anywhere (CONTRACT §8.7).
 *
 * PASSIVE SPELLCHECK, NEVER AUTOCORRECT
 * ------------------------------------
 * The platform's own spellcheck is OFF, along with autocapitalize and autocorrect, because PM
 * draws its own underline and owns its own menu — `Ignore for this draft` and
 * `Add to project dictionary` cannot exist in the native menu, and no text is ever replaced
 * without an explicit `Replace once`.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }

  /* Six named fixture files, one per resolver class, so every attachment outcome is reachable
   * from the product rather than only from a script. */
  var PICKER_FILES = [
    { name: 'provider-audit.zip', mime: 'application/zip', bytes: 2411520, icon: 'zip' },
    { name: 'settings-spec.pdf', mime: 'application/pdf', bytes: 1884160, icon: 'pdf' },
    { name: 'standup.m4a', mime: 'audio/mp4', bytes: 9437184, icon: 'audio' },
    { name: 'walkthrough.mov', mime: 'video/quicktime', bytes: 48210944, icon: 'video' },
    { name: 'allowance.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes: 306176, icon: 'sheet' },
    { name: 'capture-1.png', mime: 'image/png', bytes: 524288, icon: 'image' }
  ];

  /* Past this many characters the composer is in its `long` state: the field has grown to its
   * ceiling and starts scrolling internally rather than pushing the transcript away. */
  var LONG_CHARS = 220;

  var QUESTION_HINT = 'Answer the question above, or keep typing.';

  function Composer(hostEl, ctx) {
    this.host = hostEl;
    this.ctx = ctx;
    this.offs = [];
    this.build();
  }

  Composer.prototype._on = function (el, ev, fn) {
    this.offs.push(U().on(el, ev, fn));
  };

  Composer.prototype.svc = function (key, fallback) {
    var s = this.ctx.services && this.ctx.services[key];
    return s || global[fallback] || null;
  };

  Composer.prototype.tid = function () {
    return this.ctx.store.get('session.activeThreadId');
  };

  Composer.prototype.build = function () {
    var self = this;
    var ctx = this.ctx;
    var svc = ctx.services;

    this.root = U().el('div', { class: 'pmx-composer', data: { pmxComposer: '1', pmxCstate: 'ordinary' } });

    /* One surface. The box carries the border, the radius and the focus ring;
     * the textarea inside it is borderless and transparent. Attach and send
     * live INSIDE this box rather than in a row beneath it, so the whole
     * composer reads as a single field you type into and act from. */
    this.box = U().el('div', { class: 'pmx-composer-box' });
    this.root.appendChild(this.box);

    /* Attachment chips sit above the field, inside the same box. */
    this.chips = U().el('div', { class: 'pmx-composer-chips' });
    this.box.appendChild(this.chips);

    /* The spell layer mirrors the field's box, font and padding and sits UNDER a transparent
     * textarea. Drawing underlines this way keeps the caret, selection and IME behaviour of a
     * real textarea — a contenteditable would give prettier decorations and break all three.
     * [Slint note: this ports as a text-run list plus a decoration flag; no backdrop-filter and
     * no DOM range measurement is used here for exactly that reason.] */
    this.fieldWrap = U().el('div', { class: 'pmx-composer-fieldwrap' });
    this.spellLayer = U().el('div', { class: 'pmx-spell-layer', aria: { hidden: 'true' } });
    this.fieldWrap.appendChild(this.spellLayer);

    this.field = U().el('textarea', {
      class: 'pmx-composer-field pmx-scroll',
      aria: { label: 'Message' }
    });
    /* Platform spellcheck OFF — PM's own passive underline is the only spell UI, and the
     * platform's autocorrect would silently rewrite text, which the packet forbids outright. */
    this.field.setAttribute('spellcheck', 'false');
    this.field.setAttribute('autocapitalize', 'off');
    this.field.setAttribute('autocorrect', 'off');
    this.field.setAttribute('autocomplete', 'off');
    this.field.setAttribute('rows', '1');
    this.field.placeholder = 'Send a message';
    this.fieldWrap.appendChild(this.field);
    this.box.appendChild(this.fieldWrap);

    /* One line, always truthful, never decorative: it carries the question hint, the offline
     * queue notice, the setup reason, the cross-project scope and the disabled reason. A
     * disabled send with no stated reason is the failure this line exists to prevent. */
    this.reason = U().el('div', { class: 'pmx-composer-reason' });
    this.box.appendChild(this.reason);

    var foot = U().el('div', { class: 'pmx-composer-foot' });

    this.attachBtn = U().el('button', { class: 'pmx-composer-icon', aria: { label: 'Attach' } });
    this.attachBtn.title = 'Attach';
    this.attachBtn.appendChild(svc.icons.get('attach', 15));
    foot.appendChild(this.attachBtn);

    this.spacer = U().el('span', { class: 'pmx-composer-spacer' });
    foot.appendChild(this.spacer);

    /* Overflow holds Stop while a turn is active. Stop is never a per-message control and never
     * a second primary button. */
    this.overflowBtn = U().el('button', { class: 'pmx-composer-icon', aria: { label: 'Composer options', haspopup: 'menu' } });
    this.overflowBtn.title = 'Composer options';
    this.overflowBtn.appendChild(svc.icons.get('more', 15));
    foot.appendChild(this.overflowBtn);

    /* One primary button, one meaning at a time. Never two buttons — that is how
     * Send-means-Stop bugs happen. */
    this.sendBtn = U().el('button', { class: 'pmx-composer-send', data: { pmxState: 'send' } });
    foot.appendChild(this.sendBtn);

    this.box.appendChild(foot);

    this.host.appendChild(this.root);

    this._on(this.field, 'input', function () { self.onInput(); });
    this._on(this.field, 'keydown', function (e) { self.onKeyDown(e); });
    this._on(this.field, 'scroll', function () { self.syncSpellScroll(); });
    this._on(this.field, 'contextmenu', function (e) { self.onSpellMenu(e); });
    this._on(this.sendBtn, 'click', function () { self.onPrimary(); });
    this._on(this.attachBtn, 'click', function () { self.openPicker(); });
    this._on(this.overflowBtn, 'click', function (ev) { self.openOverflow(ev.currentTarget); });

    this._tickOff = svc.runtime.onTick(function () { self.syncButton(); self.syncState(); });

    this.syncAll();
  };

  Composer.prototype.onInput = function () {
    var tid = this.tid();
    this.ctx.services.drafts.setText(tid, this.field.value);
    this.autoGrow();
    this.syncSpell();
    /* The state machine depends on draft emptiness, so re-evaluate on every keystroke. */
    this.syncButton();
    this.syncState();
  };

  Composer.prototype.onKeyDown = function (e) {
    /* Shift+F10 is the keyboard route to the spelling menu, because a suggestion list reachable
     * only by right-click is unreachable for anyone not using a mouse. */
    if (e.key === 'F10' && e.shiftKey) {
      e.preventDefault();
      this.onSpellMenu(e);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.onPrimary();
    }
  };

  Composer.prototype.autoGrow = function () {
    this.field.style.height = 'auto';
    var max = 160;
    this.field.style.height = Math.min(this.field.scrollHeight, max) + 'px';
  };

  /* ------------------------------------------------------------------ primary action */

  Composer.prototype.onPrimary = function () {
    var tid = this.tid();
    var svc = this.ctx.services;
    var state = this.buttonState();

    if (state === 'redirect') {
      var text = this.field.value;
      if (!text || !text.trim()) return;
      var ops = this.svc('threadOps', 'PMXThreadOps');
      if (ops) ops.redirect(tid, text);
      svc.drafts.archiveOnSend(tid);
      this.field.value = '';
      this.autoGrow();
      this.syncAll();
      return;
    }

    if (state === 'disabled') return;

    var body = this.field.value;
    if (!body || !body.trim()) return;

    /* Offline: the send becomes an outbox entry with an idempotency key, and the chip that
     * appears is the entry, not a notification about it. */
    var sync = this.svc('sync', 'PMXSync');
    if (sync && sync.transport() !== 'live') {
      var entry = sync.enqueue({ commandId: 'cmd.chat.send', payload: { threadId: tid, body: body } });
      svc.drafts.archiveOnSend(tid);
      this.field.value = '';
      this.autoGrow();
      this.syncAll();
      if (entry) this.lastQueuedId = entry.id;
      return;
    }

    /* Sending while an agent works is a SEND, routed through steering, never a stop. */
    svc.drafts.archiveOnSend(tid);
    this.field.value = '';
    this.autoGrow();
    svc.runtime.send(tid, body);
    this.syncAll();
  };

  /* send | redirect | disabled. Stop is deliberately absent: it lives in the overflow now, so
   * the primary button can never be pressed meaning one thing and interpreted as another. */
  Composer.prototype.buttonState = function () {
    var tid = this.tid();
    var svc = this.ctx.services;
    var route = this.svc('route', 'PMXRoute');

    if (route) {
      var acct = this.ctx.store.runtime(tid, 'account');
      var accounts = route.accounts();
      for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].label === acct && accounts[i].state !== 'ready') return 'disabled';
      }
    }
    if (svc.runtime.isActive && svc.runtime.isActive(tid)) return 'redirect';
    return 'send';
  };

  Composer.prototype.syncButton = function () {
    var svc = this.ctx.services;
    var state = this.buttonState();
    if (this.sendBtn.getAttribute('data-pmx-state') === state && this._builtBtn) return;
    this._builtBtn = true;
    this.sendBtn.setAttribute('data-pmx-state', state);
    U().empty(this.sendBtn);
    if (state === 'redirect') {
      this.sendBtn.appendChild(svc.icons.get('redirect', 15));
      this.sendBtn.appendChild(U().el('span', { class: 'pmx-composer-send-label', text: 'Redirect' }));
      this.sendBtn.setAttribute('aria-label', 'Redirect');
      this.sendBtn.title = 'Redirect the active turn';
      this.sendBtn.disabled = false;
    } else if (state === 'disabled') {
      this.sendBtn.appendChild(svc.icons.get('send', 15));
      this.sendBtn.setAttribute('aria-label', 'Send');
      this.sendBtn.disabled = true;
    } else {
      this.sendBtn.appendChild(svc.icons.get('send', 15));
      this.sendBtn.setAttribute('aria-label', 'Send');
      this.sendBtn.title = 'Send';
      this.sendBtn.disabled = false;
    }
  };

  /* ------------------------------------------------------------------ overflow */

  Composer.prototype.openOverflow = function (anchor) {
    var self = this;
    var u = U();
    var svc = this.ctx.services;
    var tid = this.tid();

    svc.popup.open({
      anchorEl: anchor, kind: 'menu', width: 220,
      build: function (host, api) {
        function item(label, fn) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: label })
          ]);
          u.on(row, 'click', function () { api.close(); fn(); });
          host.appendChild(row);
        }
        if (svc.runtime.isActive && svc.runtime.isActive(tid)) {
          item('Stop', function () { svc.runtime.stop(tid); self.syncAll(); });
        }
        item('Clear draft', function () {
          svc.drafts.setText(tid, '');
          self.field.value = '';
          self.autoGrow();
          self.syncAll();
        });
        var spell = self.svc('spell', 'PMXSpell');
        if (spell) {
          var on = spell.enabledFor(tid);
          item(on ? 'Disable spell check in this thread' : 'Enable spell check in this thread', function () {
            spell.setEnabledFor(tid, !on);
            self.syncSpell();
          });
        }
      }
    });
  };

  /* ------------------------------------------------------------------ attachments */

  Composer.prototype.openPicker = function () {
    var self = this;
    var u = U();
    var svc = this.ctx.services;

    svc.popup.open({
      anchorEl: this.attachBtn, kind: 'list', width: 300,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-pop-title', text: 'Attach a file' }));
        PICKER_FILES.forEach(function (f) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            svc.icons.get(f.icon, 14),
            u.el('span', { class: 'pmx-popup-item-label', text: f.name }),
            u.el('span', { class: 'pmx-popup-item-hint', text: Math.round(f.bytes / 1024) + ' KB' })
          ]);
          u.on(row, 'click', function () {
            api.close();
            self.attachFile(f);
          });
          host.appendChild(row);
        });
      }
    });
  };

  /* Every attachment goes through the resolver. The old build invented
   * `screenshots/attachment-N.png` — a path to a file that does not exist, with no class, no
   * representation and no lineage — which made the entire attachment story unfalsifiable. */
  Composer.prototype.attachFile = function (f) {
    var tid = this.tid();
    var attach = this.svc('attach', 'PMXAttach');
    if (!attach) return false;
    var res = attach.resolve(tid, { name: f.name, mime: f.mime, bytes: f.bytes });
    if (res && res.class === 'unsupported' && res.actions && res.actions.length) {
      /* An unsupported attachment is a DECISION, not an error toast: the alternate route
       * changes hosting and cost, so it needs a real approval record. */
      attach.route(tid, res.id, res.actions[0].id);
    }
    this.ctx.services.drafts.addAttachment(tid, f.name);
    this.syncChips();
    this.syncState();
    return true;
  };

  Composer.prototype.syncChips = function () {
    var self = this;
    var tid = this.tid();
    var svc = this.ctx.services;
    var attach = this.svc('attach', 'PMXAttach');
    var resolutions = attach ? attach.of(tid) : [];
    var atts = svc.drafts.get(tid).attachments || [];

    U().empty(this.chips);
    this.chips.style.display = (atts.length || this.queuedEntry()) ? '' : 'none';

    /* The offline queue chip carries the entry id, because the id IS the idempotency key and
     * seeing it is what makes "this will send exactly once" checkable. */
    var queued = this.queuedEntry();
    if (queued) {
      var qchip = U().el('span', { class: 'pmx-composer-chip', data: { queued: '1' } }, [
        svc.icons.get('queued', 12),
        U().el('span', { text: 'Queued · ' + queued.id })
      ]);
      var qx = U().el('button', { class: 'pmx-composer-chip-x', aria: { label: 'Remove queued send' } });
      qx.appendChild(svc.icons.get('close', 10));
      U().on(qx, 'click', function () {
        var sync = self.svc('sync', 'PMXSync');
        if (sync) sync.remove(queued.id);
        self.syncChips();
        self.syncState();
      });
      qchip.appendChild(qx);
      this.chips.appendChild(qchip);
    }

    atts.forEach(function (path) {
      var res = null;
      for (var i = 0; i < resolutions.length; i++) if (resolutions[i].name === path) res = resolutions[i];
      var chip = U().el('span', { class: 'pmx-composer-chip', data: { cls: res ? res.class : 'native' } }, [
        svc.icons.get(res ? classIcon(res) : 'file', 12),
        U().el('span', { text: path.split('/').pop() })
      ]);
      /* The representation is the honest label: a transformed attachment is not the file, it is
       * what the model will actually read. */
      if (res && res.representation) {
        chip.appendChild(U().el('span', { class: 'pmx-composer-chip-rep', text: res.representation }));
      }
      var x = U().el('button', { class: 'pmx-composer-chip-x', aria: { label: 'Remove attachment' } });
      x.appendChild(svc.icons.get('close', 10));
      U().on(x, 'click', function () {
        svc.drafts.removeAttachment(tid, path);
        if (attach && res) attach.remove(tid, res.id);
        self.syncChips();
        self.syncState();
      });
      chip.appendChild(x);
      self.chips.appendChild(chip);
    });
  };

  function classIcon(res) {
    if (res.class === 'unsupported') return 'alert';
    if (/\.zip$/i.test(res.name)) return 'zip';
    if (/\.pdf$/i.test(res.name)) return 'pdf';
    if (/\.(m4a|mp3|wav)$/i.test(res.name)) return 'audio';
    if (/\.(mov|mp4)$/i.test(res.name)) return 'video';
    if (/\.(xlsx|csv)$/i.test(res.name)) return 'sheet';
    if (/\.(png|jpg|jpeg)$/i.test(res.name)) return 'image';
    return 'file';
  }

  Composer.prototype.queuedEntry = function () {
    var sync = this.svc('sync', 'PMXSync');
    if (!sync) return null;
    var box = sync.outbox();
    for (var i = box.length - 1; i >= 0; i--) {
      if (box[i].status !== 'sent' && box[i].payload && box[i].payload.threadId === this.tid()) return box[i];
    }
    return null;
  };

  /* ------------------------------------------------------------------ spell layer */

  Composer.prototype.syncSpell = function () {
    var spell = this.svc('spell', 'PMXSpell');
    var tid = this.tid();
    if (!spell || !spell.enabledFor(tid)) {
      U().empty(this.spellLayer);
      this.hits = [];
      return;
    }
    var text = this.field.value || '';
    this.hits = spell.check(text, tid) || [];
    U().empty(this.spellLayer);

    /* Rebuild as alternating plain runs and marked runs. Offsets come from the service, never
     * from DOM range measurement, so the layer cannot drift from the model. */
    var cursor = 0;
    for (var i = 0; i < this.hits.length; i++) {
      var h = this.hits[i];
      if (h.start > cursor) this.spellLayer.appendChild(document.createTextNode(text.slice(cursor, h.start)));
      this.spellLayer.appendChild(U().el('span', { class: 'pmx-spell-hit', text: text.slice(h.start, h.end) }));
      cursor = h.end;
    }
    if (cursor < text.length) this.spellLayer.appendChild(document.createTextNode(text.slice(cursor)));
    this.syncSpellScroll();
  };

  Composer.prototype.syncSpellScroll = function () {
    this.spellLayer.scrollTop = this.field.scrollTop;
    this.spellLayer.scrollLeft = this.field.scrollLeft;
  };

  Composer.prototype.onSpellMenu = function (ev) {
    var self = this;
    var u = U();
    var spell = this.svc('spell', 'PMXSpell');
    var tid = this.tid();
    if (!spell || !spell.enabledFor(tid) || !this.hits || !this.hits.length) return;

    /* Which hit is under the caret. Using the selection offset rather than pointer geometry
     * keeps the right-click and the Shift+F10 paths identical. */
    var pos = this.field.selectionStart;
    var hit = null;
    for (var i = 0; i < this.hits.length; i++) {
      if (pos >= this.hits[i].start && pos <= this.hits[i].end) { hit = this.hits[i]; break; }
    }
    if (!hit) return;
    ev.preventDefault();

    this.ctx.services.popup.open({
      anchorEl: this.field, kind: 'menu', width: 230,
      build: function (host, api) {
        host.appendChild(u.el('div', { class: 'pmx-popup-group', text: hit.word }));

        (hit.suggestions || []).slice(0, 3).forEach(function (s) {
          var row = u.el('button', { class: 'pmx-popup-item' }, [
            u.el('span', { class: 'pmx-popup-item-label', text: s })
          ]);
          u.on(row, 'click', function () {
            /* Replace ONCE, at this hit's own offsets. Nothing in this file ever rewrites text
             * on its own — that is the difference between a suggestion and autocorrect. */
            var next = spell.replaceOnce(tid, { start: hit.start, end: hit.end, text: self.field.value }, s);
            self.field.value = next;
            self.ctx.services.drafts.setText(tid, next);
            self.syncSpell();
            api.close();
          });
          host.appendChild(row);
        });

        [['Replace once', function () {
          var first = (hit.suggestions || [])[0];
          if (!first) return;
          var next = spell.replaceOnce(tid, { start: hit.start, end: hit.end, text: self.field.value }, first);
          self.field.value = next;
          self.ctx.services.drafts.setText(tid, next);
          self.syncSpell();
        }],
        ['Ignore once', function () { spell.ignoreOnce(tid, hit); self.syncSpell(); }],
        ['Ignore for this draft', function () { spell.ignoreForDraft(tid, hit.word); self.syncSpell(); }],
        ['Add to personal dictionary', function () { spell.addPersonal(hit.word); self.syncSpell(); }],
        ['Add to project dictionary', function () { spell.addProject(hit.word); self.syncSpell(); }]
        ].forEach(function (pair) {
          var canProject = pair[0] !== 'Add to project dictionary' || spell.canAddProject();
          var row = u.el('button', {
            class: 'pmx-popup-item',
            aria: { disabled: canProject ? 'false' : 'true' }
          }, [u.el('span', { class: 'pmx-popup-item-label', text: pair[0] })]);
          if (!canProject) {
            /* Disabled WITH a reason, never a vanished item: the user needs to know the project
             * dictionary exists and why it is not writable here. */
            row.appendChild(u.el('span', { class: 'pmx-popup-item-hint', text: 'Project dictionary is read-only' }));
            u.on(row, 'click', function (e2) { e2.preventDefault(); });
          } else {
            u.on(row, 'click', function () { pair[1](); api.close(); });
          }
          host.appendChild(row);
        });
      }
    });
  };

  /* ------------------------------------------------------------------ state */

  /* The ten-state resolution, in priority order. Order matters: a disabled route outranks
   * everything because nothing can be sent at all; a question outranks a long draft because the
   * hint is what the user needs to read next. */
  Composer.prototype.resolveState = function () {
    var tid = this.tid();
    var svc = this.ctx.services;

    var route = this.svc('route', 'PMXRoute');
    if (route) {
      var acct = this.ctx.store.runtime(tid, 'account');
      var accounts = route.accounts();
      for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].label === acct && accounts[i].state !== 'ready') return 'setup-required';
      }
    }

    var ap = this.svc('approvals', 'PMXApprovals');
    if (ap) {
      var pending = ap.pending(tid) || [];
      for (var j = 0; j < pending.length; j++) {
        if (pending[j].kind === 'grant' && pending[j].status !== 'decided') return 'cross-project';
      }
    }

    if (svc.runtime.isActive && svc.runtime.isActive(tid)) return 'redirect';

    var sync = this.svc('sync', 'PMXSync');
    if (sync && sync.transport() !== 'live') return 'offline-queued';

    if (svc.questionnaire.isComposerLocked(tid)) return 'question';

    if (this.hits && this.hits.length) return 'spell';

    var atts = svc.drafts.get(tid).attachments || [];
    if (atts.length) return 'attachments';

    if ((this.field.value || '').length > LONG_CHARS) return 'long';

    if (this.sendBtn.disabled) return 'disabled';

    return 'ordinary';
  };

  Composer.prototype.syncState = function () {
    var tid = this.tid();
    var state = this.resolveState();
    this.root.setAttribute('data-pmx-cstate', state);

    var line = '';
    if (state === 'question') {
      line = QUESTION_HINT;
    } else if (state === 'offline-queued') {
      var sync = this.svc('sync', 'PMXSync');
      line = 'You are offline. Sends are queued and replayed once, in order.';
      if (sync && sync.transport() === 'reconnecting') line = 'Reconnecting. Queued sends replay once.';
    } else if (state === 'setup-required') {
      var route = this.svc('route', 'PMXRoute');
      var acct = this.ctx.store.runtime(tid, 'account');
      var accounts = route ? route.accounts() : [];
      for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].label === acct) line = route.setupReason(accounts[i].state) + '.';
      }
    } else if (state === 'cross-project') {
      line = 'A cross-project request is waiting for your decision.';
    } else if (state === 'redirect') {
      line = 'The turn is running. Sending now redirects it.';
    } else if (state === 'disabled') {
      line = 'Sending is unavailable right now.';
    }

    U().empty(this.reason);
    if (line) this.reason.appendChild(U().el('span', { text: line }));

    /* The setup state is the one case with a real destination, so it gets a real link carrying
     * the return context — "open the exact place that fixes this", not "open settings". */
    if (state === 'setup-required') {
      var r2 = this.svc('route', 'PMXRoute');
      var acct2 = this.ctx.store.runtime(tid, 'account');
      var accts = r2 ? r2.accounts() : [];
      for (var k = 0; k < accts.length; k++) {
        if (accts[k].label !== acct2) continue;
        var target = r2.settingsTarget(accts[k].id);
        /* The acquisition policy sentence goes IN the composer's reason row, next to the diagnosis.
         * PROVIDER_CLI_FINAL_ADJUDICATION.md governs where a provider tool comes from the first time,
         * and this is the surface a user reads immediately before choosing to start setup — offering
         * the link without it would collect consent from someone who was not told that Puppet Master
         * fetches the tool from the provider's official source and does not bundle it. */
        if (target.acquisition) {
          this.reason.appendChild(U().el('span', {
            class: 'pmx-composer-policy', text: ' ' + target.acquisition.oneLine
          }));
          /* Installation and authentication being separate is the second governing clause, and it is
           * the one users are most likely to assume the opposite of. */
          this.reason.appendChild(U().el('span', {
            class: 'pmx-composer-policy', text: ' ' + target.acquisition.separation
          }));
        }
        var link = U().el('button', {
          class: 'pmx-composer-link', type: 'button',
          text: target.acquisition ? (target.acquisition.action + ' \u00b7 ' + target.label) : target.label
        });
        var self = this;
        U().on(link, 'click', function () {
          var toast = self.svc('toast', 'PMXToast');
          if (toast) toast.show(target.destination + ' \u00b7 ' + target.returnContext.returnLabel);
        });
        this.reason.appendChild(link);
      }
    }

    this.reason.style.display = this.reason.childNodes.length ? '' : 'none';
  };

  Composer.prototype.syncAll = function () {
    var tid = this.tid();
    var d = this.ctx.services.drafts.get(tid);
    if (this.field.value !== (d.text || '')) this.field.value = d.text || '';
    this.autoGrow();
    this.syncChips();
    this.syncSpell();
    this.syncButton();
    this.syncState();
  };

  Composer.prototype.update = function (state, changed) {
    var relevant = changed.some(function (k) {
      return String(k).indexOf('view') === 0 || String(k).indexOf('session') === 0;
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
    mount: function (hostEl, ctx) { return new Composer(hostEl, ctx); },
    PICKER_FILES: PICKER_FILES,
    QUESTION_HINT: QUESTION_HINT,
    STATES: ['ordinary', 'long', 'attachments', 'question', 'redirect', 'offline-queued',
             'setup-required', 'cross-project', 'spell', 'disabled']
  };
})(window);
