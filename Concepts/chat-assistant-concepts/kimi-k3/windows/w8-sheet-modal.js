/* ============================================================================
   Kimi K3 — W8 Sheet Modal (chat-window concept).

   Compact header, then the transcript, then the composer. Chat history,
   the work surfaces (Goal / Todo / work chips), and search each open as a
   BOTTOM SHEET — an absolute bottom overlay (max-height 60%) that slides
   up over a scrim, closes on Esc or scrim click, and shows only one sheet
   at a time (mutual exclusion). The Chats sheet carries a pin toggle in its
   header: when pinned, Esc and scrim-click do not close it (pin persists per
   thread in surfaceView.<tid>.w8HistoryPinned). The sheet triggers are a
   slim action row under the header.

   Provides exactly one [data-k3-slot="thread"] and one
   [data-k3-slot="composer"]; the host fills them (THE ONE HARD RULE).
   ========================================================================== */
(function () {
  'use strict';

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  function humanizeStatus(status) {
    var s = String(status || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Active';
  }

  // sheet trigger spec: { id, iconName, label }
  var TRIGGERS = [
    { id: 'chats', iconName: 'history', label: 'Chats' },
    { id: 'work', iconName: 'activity', label: 'Work' },
    { id: 'search', iconName: 'search', label: 'Search' }
  ];

  window.K3.registerWindow('w8', {
    meta: {
      id: 'w8',
      name: 'Sheet Modal',
      blurb: 'Compact header with the transcript front and center; chat history, work surfaces, and search slide up as bottom sheets.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var currentTid = null;
      var unmounted = false;

      // live kit elements owned by the sheets
      var historyNode = null;
      var searchNode = null;
      var workNodes = [];        // goal / todo / chips elements
      var workSummarySpan = null;

      var openSheet = null;       // 'chats' | 'work' | 'search' | null
      var sheetHideTimer = null;
      var onKeyCapture = null;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w8-root');
      root.setAttribute('data-k3-window', 'w8');

      var main = el('div', 'w8-main');

      // compact header; suppress its own search button — the Search sheet is
      // this concept's search entry point.
      var headerEl = kit.header(ctx, { compact: true, showSearch: false });
      main.appendChild(headerEl);

      var lensHost = kit.lensBannerHost(ctx);
      main.appendChild(lensHost.element);

      // action row: one button per sheet trigger
      var actions = el('div', 'w8-actions');
      var triggerBtns = {};
      TRIGGERS.forEach(function (t) {
        var btn = el('button', 'w8-action');
        btn.type = 'button';
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('data-testid', 'w8-open-' + t.id);
        var ic = el('span', 'w8-action-ic');
        ic.appendChild(icon(t.iconName));
        var lb = el('span', 'w8-action-label', t.label);
        var badge = el('span', 'w8-action-badge');
        badge.setAttribute('data-w8-badge', t.id);
        btn.appendChild(ic);
        btn.appendChild(lb);
        btn.appendChild(badge);
        btn.addEventListener('click', function () { toggleSheet(t.id); });
        actions.appendChild(btn);
        triggerBtns[t.id] = btn;
      });
      main.appendChild(actions);
      workSummarySpan = el('span', 'w8-work-summary');
      actions.appendChild(workSummarySpan);

      var threadSlot = el('div', 'w8-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      main.appendChild(threadSlot);

      var composerSlot = el('div', 'w8-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      main.appendChild(composerSlot);

      root.appendChild(main);

      // overlay layer: scrim + three sheets (display:none while closed)
      var scrim = el('div', 'w8-scrim');
      var sheets = {};
      var chatsPin = null;   // pin toggle on the Chats sheet header
      TRIGGERS.forEach(function (t) {
        var sheet = el('div', 'w8-sheet');
        sheet.setAttribute('data-w8-sheet', t.id);
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-label', t.label);
        var head = el('div', 'w8-sheet-head');
        // a leading title group so the title + (optional) pin sit together on
        // the left and the close button stays on the right.
        var titleGroup = el('span', 'w8-sheet-titlegroup');
        titleGroup.appendChild(el('span', 'w8-sheet-title', t.label === 'Chats' ? 'Chat history' : (t.label === 'Work' ? 'Work' : 'Search')));
        // Chats sheet gains a pin toggle: when pinned, Esc/scrim-click do not close it
        if (t.id === 'chats') {
          chatsPin = el('button', 'k3-icon-btn w8-sheet-pin');
          chatsPin.type = 'button';
          chatsPin.setAttribute('aria-pressed', 'false');
          chatsPin.setAttribute('aria-label', 'Pin chat history');
          chatsPin.title = 'Pin chat history';
          chatsPin.setAttribute('data-testid', 'w8-history-pin');
          chatsPin.appendChild(icon('pin'));
          chatsPin.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!currentTid) currentTid = store.get('activeThreadId', null);
            store.set('surfaceView.' + currentTid + '.w8HistoryPinned', !historyPinned());
          });
          titleGroup.appendChild(chatsPin);
        }
        head.appendChild(titleGroup);
        var closeBtn = el('button', 'k3-icon-btn w8-sheet-close');
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Close ' + (t.label === 'Chats' ? 'history' : t.label.toLowerCase()));
        closeBtn.appendChild(icon('close'));
        closeBtn.addEventListener('click', function () { closeSheets(); });
        head.appendChild(closeBtn);
        var body = el('div', 'w8-sheet-body k3-scroll');
        sheet.appendChild(head);
        sheet.appendChild(body);
        root.appendChild(sheet);
        sheets[t.id] = { sheet: sheet, body: body };
      });
      root.appendChild(scrim);

      hostEl.appendChild(root);

      /* ---- presence / summary -------------------------------------------- */
      function presence(tid) {
        var t = tid ? data.thread(tid) : null;
        var p = { goal: false, todo: false, chips: false, todoDone: 0, todoTotal: 0, agents: 0, files: 0 };
        if (!t) return p;
        if (t.activeGoal && !store.get('goalView.' + tid + '.cleared', false)) p.goal = true;
        var items = t.todo && arr(t.todo.items);
        if (items && items.length) {
          p.todo = true;
          p.todoTotal = items.length;
          p.todoDone = items.filter(function (i) { return String(i.state).toLowerCase() === 'complete'; }).length;
        }
        var hasActivity = arr(t.messages).some(function (m) { return !!m.activityGroup; });
        arr(t.subagentGroups).forEach(function (g) { p.agents += arr(g.agents).length; });
        arr(t.diffGroups).forEach(function (g) { p.files += arr(g.files).length; });
        p.chips = p.agents > 0 || p.files > 0 || hasActivity;
        return p;
      }
      function workSummary(p, tid) {
        var parts = [];
        if (p.goal) {
          var g = data.thread(tid).activeGoal;
          parts.push('Goal: ' + humanizeStatus(g.status));
        }
        if (p.todo) parts.push('Todo ' + p.todoDone + '/' + p.todoTotal);
        if (p.agents) parts.push(p.agents + (p.agents === 1 ? ' agent' : ' agents'));
        if (p.files) parts.push(p.files + (p.files === 1 ? ' file changed' : ' files changed'));
        return parts.join(' · ');
      }

      /* ---- work sheet contents ------------------------------------------- */
      function unmountWork() {
        workNodes.forEach(function (n) {
          try { if (n && n.unmount) n.unmount(); } catch (e) { /* ignore */ }
        });
        workNodes = [];
        var wb = sheets.work.body;
        wb.innerHTML = '';
      }
      function buildWork() {
        unmountWork();
        var p = presence(currentTid);
        var wb = sheets.work.body;
        if (!p.goal && !p.todo && !p.chips) {
          wb.appendChild(el('div', 'w8-empty', 'No goal, task, or work data on this thread.'));
          return;
        }
        if (p.goal) { var g = kit.goalSurface(ctx, currentTid); if (g) { workNodes.push(g); wb.appendChild(g); } }
        if (p.todo) { var td = kit.todoSurface(ctx, currentTid); if (td) { workNodes.push(td); wb.appendChild(td); } }
        if (p.chips) { var c = kit.workChips(ctx, currentTid); if (c) { workNodes.push(c); wb.appendChild(c); } }
      }

      /* ---- search sheet contents ----------------------------------------- */
      function ensureSearch() {
        if (searchNode) return;
        searchNode = kit.searchBox(ctx);
        sheets.search.body.appendChild(searchNode);
      }

      /* ---- chats sheet contents ------------------------------------------ */
      function ensureHistory() {
        if (historyNode) return;
        historyNode = kit.historyPanel(ctx);
        sheets.chats.body.appendChild(historyNode);
      }

      /* ---- badges + summary ---------------------------------------------- */
      function paintBadges() {
        var p = presence(currentTid);
        // work badge = count of present work kinds
        var workKinds = (p.goal ? 1 : 0) + (p.todo ? 1 : 0) + (p.chips ? 1 : 0);
        setBadge('work', workKinds ? String(workKinds) : '');
        // chats badge = pending questionnaire indicator dot text (none numeric)
        var t = currentTid ? data.thread(currentTid) : null;
        var pending = 0;
        if (t && arr(t.questionnaires)) {
          pending = t.questionnaires.filter(function (q) { return !q.resolved; }).length;
        }
        setBadge('chats', pending ? String(pending) : '');
        setBadge('search', '');
        // work summary line in the action row
        var anyWork = p.goal || p.todo || p.chips;
        workSummarySpan.textContent = anyWork ? workSummary(p, currentTid) : '';
        workSummarySpan.hidden = !anyWork;
      }
      function setBadge(id, text) {
        var b = actions.querySelector('[data-w8-badge="' + id + '"]');
        if (b) {
          b.textContent = text || '';
          b.hidden = !text;
        }
      }

      /* ---- rebuild on thread change -------------------------------------- */
      function rebuild() {
        currentTid = store.get('activeThreadId', null);
        buildWork();        // work sheet is thread-scoped -> rebuild
        paintBadges();
        // history + search are not thread-scoped at the element level; leave
        // them mounted (they read the store live).
        ensureHistory();
        ensureSearch();
      }

      /* ---- sheet open/close ---------------------------------------------- */
      function applyOpen() {
        var chatsDocked = historyPinned(); // docked chats is managed by paintPin
        // the scrim only shows for an un-pinned overlay sheet (never when the
        // chats sheet is docked/pinned).
        var showScrim = !!openSheet && !(openSheet === 'chats' && chatsDocked);
        scrim.style.display = showScrim ? '' : 'none';
        scrim.classList.toggle('is-open', showScrim);
        Object.keys(sheets).forEach(function (id) {
          if (id === 'chats' && chatsDocked) return; // docked chats is persistent
          var s = sheets[id].sheet;
          s.style.display = '';
          var isOpen = id === openSheet;
          s.classList.toggle('is-open', isOpen);
          triggerBtns[id].setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          triggerBtns[id].classList.toggle('is-active', isOpen);
        });
        // if nothing is open, hide the overlay layer once the slide lands
        if (!openSheet) {
          clearTimeout(sheetHideTimer);
          sheetHideTimer = setTimeout(function () {
            if (!openSheet) {
              scrim.style.display = 'none';
              scrim.classList.remove('is-open');
              Object.keys(sheets).forEach(function (id) {
                if (id === 'chats' && historyPinned()) return; // keep docked chats
                sheets[id].sheet.style.display = 'none';
              });
            }
          }, window.K3.motionReduced() ? 0 : 240);
        } else {
          clearTimeout(sheetHideTimer);
        }
      }
      function openSheetId(id) {
        openSheet = id;
        // lazily mount the sheet's kit contents the first time it opens
        if (id === 'chats') ensureHistory();
        if (id === 'search') ensureSearch();
        if (id === 'work') buildWork();
        applyOpen();
      }
      function closeSheets() {
        // a pinned Chats sheet ignores Esc / scrim-click / close-on-toggle
        if (openSheet === 'chats' && historyPinned()) return;
        openSheet = null;
        applyOpen();
      }
      function toggleSheet(id) {
        if (openSheet === id) closeSheets();
        else openSheetId(id);
      }

      // Chats pin: when on, Esc / scrim-click do not close the chats sheet.
      function historyPinned() {
        return store.get('surfaceView.' + currentTid + '.w8HistoryPinned', false) === true;
      }
      var chatsDocked = false; // tracks whether the chats sheet is currently docked
      function paintPin() {
        if (!chatsPin) return;
        var pinned = historyPinned();
        chatsPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        chatsPin.classList.toggle('is-pinned', pinned);
        chatsPin.setAttribute('aria-label', pinned ? 'Unpin chat history' : 'Pin chat history');
        chatsPin.title = pinned ? 'Unpin chat history' : 'Pin chat history';
        chatsPin.innerHTML = '';
        chatsPin.appendChild(icon(pinned ? 'pin-off' : 'pin'));

        // Only act on the pinned <-> unpinned TRANSITION so this is safe to call
        // from the wrapped applyOpen on every open/close without clobbering the
        // currently open overlay sheet (e.g. Work/Search).
        if (pinned === chatsDocked) return;
        chatsDocked = pinned;

        // When pinned, the Chats sheet stops being an absolute bottom overlay
        // (which covered the composer) and becomes an IN-FLOW compact strip
        // docked just above the composer slot. We reparent it into .w8-main
        // right before the composer so it reserves layout space and the
        // composer stays fully usable. Unpinning moves it back to the overlay
        // layer and restores normal sheet behavior.
        var chatsSheet = sheets.chats.sheet;
        root.classList.toggle('is-chats-pinned', pinned);
        if (pinned) {
          ensureHistory(); // mount history content before docking
          chatsSheet.style.display = '';
          chatsSheet.classList.add('is-open');
          chatsSheet.classList.add('is-pinned-docked');
          if (chatsSheet.parentNode !== main) {
            main.insertBefore(chatsSheet, composerSlot);
          }
          // close any other open overlay sheet (mutual exclusion with the dock)
          if (openSheet && openSheet !== 'chats') {
            var other = sheets[openSheet];
            if (other) {
              other.sheet.classList.remove('is-open');
              triggerBtns[openSheet].setAttribute('aria-expanded', 'false');
              triggerBtns[openSheet].classList.remove('is-active');
            }
            openSheet = null;
          }
          // reflect the docked chats as the active trigger
          triggerBtns.chats.setAttribute('aria-expanded', 'true');
          triggerBtns.chats.classList.add('is-active');
          // drop the scrim so the transcript behind stays interactive
          scrim.classList.remove('is-open');
          scrim.style.display = 'none';
        } else {
          chatsSheet.classList.remove('is-pinned-docked');
          // return the sheet to the overlay layer (right before the scrim)
          if (chatsSheet.parentNode === main) {
            root.insertBefore(chatsSheet, scrim);
          }
          triggerBtns.chats.setAttribute('aria-expanded', 'false');
          triggerBtns.chats.classList.remove('is-active');
          // collapse the now-unpinned sheet as an overlay
          chatsSheet.classList.remove('is-open');
          if (openSheet === 'chats') openSheet = null;
          clearTimeout(sheetHideTimer);
          sheetHideTimer = setTimeout(function () {
            if (!openSheet && !historyPinned()) {
              scrim.style.display = 'none';
              Object.keys(sheets).forEach(function (id) { sheets[id].sheet.style.display = 'none'; });
            }
          }, window.K3.motionReduced() ? 0 : 240);
        }
      }

      // Esc closes (capture, so it beats a sheet-internal handler); scrim click closes
      onKeyCapture = function (e) {
        if (e.key === 'Escape' && openSheet) {
          if (openSheet === 'chats' && historyPinned()) return; // pinned: ignore
          e.stopPropagation();
          closeSheets();
        }
      };
      actions.addEventListener('click', function () {}); // no-op; buttons handle their own clicks
      scrim.addEventListener('click', function () {
        // a pinned Chats sheet ignores scrim clicks
        if (openSheet === 'chats' && historyPinned()) return;
        closeSheets();
      });

      function onInteractOpen() {
        if (openSheet) document.addEventListener('keydown', onKeyCapture, true);
        else document.removeEventListener('keydown', onKeyCapture, true);
      }

      // wrap applyOpen so the Esc listener tracks open state and the pin
      // scrim-drop is applied whenever the chats sheet opens.
      (function wrap() {
        var orig = applyOpen;
        applyOpen = function () { orig(); onInteractOpen(); paintPin(); };
      })();

      /* ---- wiring -------------------------------------------------------- */
      disposers.push(store.subscribe('activeThreadId', rebuild));
      disposers.push(store.subscribe('surfaceView', function () {
        // pinning the chats sheet opens it if it is not already open, so the
        // pin is immediately useful; unpinning just repaints.
        if (historyPinned() && openSheet !== 'chats') openSheetId('chats');
        else paintPin();
      }));
      disposers.push(store.subscribe('goalView', function () { buildWork(); paintBadges(); }));
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved') {
          buildWork();
          paintBadges();
        }
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });

      /* ---- boot + teardown ----------------------------------------------- */
      // resting state: overlay hidden
      scrim.style.display = 'none';
      Object.keys(sheets).forEach(function (id) { sheets[id].sheet.style.display = 'none'; });
      rebuild();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        clearTimeout(sheetHideTimer);
        document.removeEventListener('keydown', onKeyCapture, true);
        // tear down owned kit elements
        try { if (historyNode && historyNode.unmount) historyNode.unmount(); } catch (e) { /* ignore */ }
        try { if (searchNode && searchNode.unmount) searchNode.unmount(); } catch (e) { /* ignore */ }
        unmountWork();
        disposers.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
        disposers = [];
        try { if (headerEl.unmount) headerEl.unmount(); } catch (e) { /* ignore */ }
        try { lensHost.unmount(); } catch (e) { /* ignore */ }
        root.remove();
      }

      return { unmount: unmount };
    }
  });
})();
