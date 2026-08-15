window.PMChatThreadKit = (() => {
  const esc = window.PMFmt.esc;
  const fmt = window.PMFmt;
  const PREVIEW_CHARS = 300;
  const SUBCOMPACT_CHARS = 90;

  function _arr(els) {
    if (!els) return [];
    if (Array.isArray(els)) return els;
    if (typeof els.length === "number") { try { return Array.prototype.slice.call(els); } catch (e) { return []; } }
    return [els];
  }

  /* Guarded motion facade. Every call degrades to the correct FINAL visual
     state when window.PMAnim is absent (anim.js not yet wired) so the build
     verifies in parallel and reduced-motion end-states stay correct. */
  const A = {
    reduced() {
      if (window.PMAnim) return window.PMAnim.reduced();
      try { return document.documentElement.dataset.motion === "reduced" || !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; }
    },
    flip(els, mutate, opts) { if (window.PMAnim) return window.PMAnim.flip(els, mutate, opts); if (typeof mutate === "function") mutate(); },
    staggerIn(els, opts) {
      if (window.PMAnim) return window.PMAnim.staggerIn(els, opts);
      _arr(els).forEach(el => { if (el && el.style) { el.style.opacity = "1"; el.style.transform = "none"; } });
    },
    springTo(setter, from, to, opts) { if (window.PMAnim) return window.PMAnim.springTo(setter, from, to, opts); try { setter(to); } catch (e) {} },
    crossfadeNum(cell, text, opts) { if (window.PMAnim) return window.PMAnim.crossfadeNum(cell, text, opts); if (cell) cell.textContent = text; },
    morphClip(el, from, to, opts) {
      opts = opts || {};
      if (window.PMAnim) return window.PMAnim.morphClip(el, from, to, opts);
      if (el && el.style) el.style.clipPath = "inset(" + to + ")";
      if (typeof opts.onDone === "function") { try { opts.onDone(); } catch (e) {} }
    },
    pop(el, opts) { if (window.PMAnim) return window.PMAnim.pop(el, opts); },
    strike(el) { if (window.PMAnim) return window.PMAnim.strike(el); else if (el && el.classList) el.classList.add("pmq-strike"); }
  };

  function orbitHtml(cls) {
    return '<span class="pmq-orbit' + (A.reduced() ? " pmq-static" : "") + (cls ? " " + cls : "") + '">' +
      '<span class="pair"><i></i><i></i></span><span class="pair"><i></i><i></i></span></span>';
  }

  /* Self-contained status glyph (does not depend on the §E window-kit helper,
     which may not exist yet in a parallel build). */
  function stateGlyph(kind) {
    if (kind === "running" || kind === "working") return orbitHtml("pmq-glyph");
    if (kind === "paused") return '<span class="pmq-glyph pmq-glyph-bars"><i></i><i></i></span>';
    if (kind === "blocked" || kind === "attention") return '<span class="pmq-glyph pmq-glyph-alert"><i></i></span>';
    if (kind === "complete") return '<svg class="pmq-glyph pmq-glyph-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>';
    return '<span class="pmq-glyph pmq-glyph-ready"><i></i></span>';
  }

  function checkSvg(cls, animated) {
    const style = animated
      ? 'style="stroke-dasharray:1;stroke-dashoffset:0;animation:pmq-draw .32s var(--ease-out) both"'
      : 'style="stroke-dasharray:1;stroke-dashoffset:0"';
    return '<svg class="pmq-checkdraw' + (cls ? " " + cls : "") + '" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" ' + style + "></path></svg>";
  }

  /* grid-rows expand/collapse wrapper: always rendered, toggles 0fr<->1fr.
     `sid` stamps a stable data-sid so the post-mutation node can be found and
     animated (the band is rebuilt every store tick, so a node is born already
     carrying .pmq-open and the authored CSS transition never interpolates). */
  function gridWrap(open, innerHtml, extraClass, sid) {
    return '<div class="pmq-gw' + (open ? " pmq-open" : "") + (extraClass ? " " + extraClass : "") + '"' +
      (sid ? ' data-sid="' + sid + '"' : "") + '>' +
      '<div class="pmq-gwi">' + innerHtml + '</div></div>';
  }

  /* WAAPI driver for grid-template-rows. Degrades safely: no PMAnim / reduced
     motion / no WAAPI just fire onDone (correct static end-state). var() easing
     is rejected by WAAPI, so retry with the literal --ease-out curve. */
  const GRID_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  function gridRowsAnimate(el, from, to, dur, onDone) {
    const done = () => { if (typeof onDone === "function") { try { onDone(); } catch (e) {} } };
    if (!el || !window.PMAnim || A.reduced() || typeof el.animate !== "function") { done(); return; }
    let anim = null;
    try {
      anim = el.animate([{ gridTemplateRows: from }, { gridTemplateRows: to }], { duration: dur, easing: "var(--ease-out)" });
    } catch (e) {
      try { anim = el.animate([{ gridTemplateRows: from }, { gridTemplateRows: to }], { duration: dur, easing: GRID_EASE }); } catch (e2) { anim = null; }
    }
    if (anim && anim.finished) { anim.finished.then(done).catch(done); } else { done(); }
  }

  function mount(slotEl, ctx, opts) {
    opts = opts || {};
    const env = ctx.env;
    const store = env.store;
    const disposers = [];
    let intervals = [];
    let composer = null;
    let questZone = null;
    let scrollerEl = null;
    let streamEl = null;
    let jumpEl = null;
    let bandEl = null;
    let widthPx = ctx.contentWidthPx || env.widthPx;

    slotEl.innerHTML = "";
    slotEl.classList.add("pmq-thread");
    slotEl.dataset.structure = opts.structure || "prose";
    slotEl.style.setProperty("--pmq-content-w", widthPx + "px");

    const root = document.createElement("div");
    root.className = "pmq-troot" + (opts.rootClass ? " " + opts.rootClass : "");
    slotEl.appendChild(root);

    const sweepEl = document.createElement("div");
    sweepEl.className = "pmq-sweep";
    sweepEl.setAttribute("aria-hidden", "true");
    root.appendChild(sweepEl);

    if (opts.surfacesPlacement === "band") {
      bandEl = document.createElement("div");
      bandEl.className = "pmq-surfaceband pmq-scroll";
      root.appendChild(bandEl);
    }

    scrollerEl = document.createElement("div");
    scrollerEl.className = "pmq-scroller pmq-scroll";
    scrollerEl.style.overflowAnchor = "none";
    root.appendChild(scrollerEl);

    streamEl = document.createElement("div");
    streamEl.className = "pmq-stream";
    scrollerEl.appendChild(streamEl);

    jumpEl = document.createElement("div");
    jumpEl.className = "pmq-jump";
    jumpEl.innerHTML = '<button type="button" class="pmq-jump-pill"><i data-ico="jumpLatest"></i><span>Latest</span></button>';
    window.PMIcons.hydrate(jumpEl);
    jumpEl.querySelector("button").addEventListener("click", () => scrollBottom(true));
    scrollerEl.appendChild(jumpEl);

    /* Pinned footer band for the working row: a sibling of the scroller, never
       inside it, so the stream can never scroll over or half-cut it. */
    const workingZone = document.createElement("div");
    workingZone.className = "pmq-workingzone";
    root.appendChild(workingZone);

    questZone = document.createElement("div");
    questZone.className = "pmq-questzone";
    root.appendChild(questZone);
    /* Escape cancels an active questionnaire from any renderer (a11y).
       Document-level so it works regardless of focus; popup Escape handlers
       stop propagation first, so open popups keep precedence. */
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const q = store.activeQuestionnaire(activeKey());
      if (q) { e.preventDefault(); e.stopPropagation(); store.questCancel(q); }
    });

    const composerEl = document.createElement("div");
    composerEl.className = "pmq-composerzone";
    root.appendChild(composerEl);

    composer = buildComposer(composerEl);

    function activeKey() { return store.activeKey(); }
    function st() { return store.thread(activeKey()); }

    function findWrap(sid) {
      return slotEl.querySelector('.pmq-gw[data-sid="' + sid + '"]');
    }

    /* EXPAND: mutate first (the synchronous rebuild births the new wrapper
       already .pmq-open = 1fr), then pin it to 0fr inline, force a reflow so
       0fr is the committed start, and WAAPI it open. On finish clear the inline
       override so the CSS .pmq-open rule (1fr) holds. Reduced/no-PMAnim leaves
       the born-open node as-is (correct static end-state). */
    function expandSurface(sid, mutateFn) {
      mutateFn();
      if (!window.PMAnim || A.reduced()) return;
      const wrap = findWrap(sid);
      if (!wrap) return;
      wrap.style.transition = "none"; /* WAAPI drives it; suppress the CSS transition */
      wrap.style.gridTemplateRows = "0fr";
      void wrap.offsetHeight;
      gridRowsAnimate(wrap, "0fr", "1fr", 240, () => {
        wrap.style.gridTemplateRows = "";
        wrap.style.transition = "";
      });
    }

    /* COLLAPSE: two-phase. Animate the CURRENT open wrapper 1fr->0fr first and
       only mutate on finish (the rebuild destroys the node already at 0fr, so
       the user sees the collapse). Reduced/no-PMAnim mutates immediately. */
    function collapseSurface(sid, mutateFn) {
      if (!window.PMAnim || A.reduced()) { mutateFn(); return; }
      const wrap = findWrap(sid);
      if (!wrap) { mutateFn(); return; }
      wrap.style.transition = "none";
      void wrap.offsetHeight;
      gridRowsAnimate(wrap, "1fr", "0fr", 220, () => {
        wrap.style.gridTemplateRows = "0fr";
        wrap.style.transition = "";
        mutateFn();
      });
    }

    /* Direction is read from the live wrapper's .pmq-open class (robust for
       surfaces whose open state derives from several flags, e.g. thought). */
    function toggleSurface(sid, mutateFn) {
      const wrap = findWrap(sid);
      if (wrap && wrap.classList.contains("pmq-open")) collapseSurface(sid, mutateFn);
      else expandSurface(sid, mutateFn);
    }

    function flyToTab(fromEl) {
      if (!fromEl || A.reduced()) return;
      try {
        const r = fromEl.getBoundingClientRect();
        if (env.hostApi && typeof env.hostApi.flyToTab === "function") {
          env.hostApi.flyToTab({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
        }
      } catch (e) {}
    }

    function firstVisibleMsgEl() {
      if (!scrollerEl) return null;
      const top = scrollerEl.getBoundingClientRect().top;
      const els = streamEl.querySelectorAll(".pmq-msg[data-msgid], .pmq-msggroup[data-firstid]");
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom > top + 4) return el;
      }
      return els[els.length - 1] || null;
    }

    function recordAnchor() {
      const el = firstVisibleMsgEl();
      const s = st();
      if (!s) return;
      s.scrollAnchorId = el ? (el.dataset.msgid || el.dataset.firstid) : null;
      const nearBottom = scrollerEl.scrollHeight - scrollerEl.scrollTop - scrollerEl.clientHeight < 48;
      s.stickToBottom = nearBottom;
    }

    function scrollBottom(smooth) {
      scrollerEl.scrollTo({ top: scrollerEl.scrollHeight, behavior: smooth && document.documentElement.dataset.motion !== "reduced" ? "smooth" : "auto" });
    }

    function restoreAnchor(id) {
      const s = st();
      if (id == null) id = s ? s.scrollAnchorId : null;
      if (!id || !s || s.stickToBottom) { scrollBottom(false); updateJump(); return; }
      const el = streamEl.querySelector('[data-msgid="' + CSS.escape(id) + '"], [data-firstid="' + CSS.escape(id) + '"]');
      if (el) scrollerEl.scrollTop = el.offsetTop - scrollerEl.offsetTop - 12;
      else scrollBottom(false);
      updateJump();
    }

    function updateJump() {
      const nearBottom = scrollerEl.scrollHeight - scrollerEl.scrollTop - scrollerEl.clientHeight < 48;
      jumpEl.classList.toggle("pmq-visible", !nearBottom);
      if (scrollerEl) st() && (st().stickToBottom = nearBottom);
    }

    scrollerEl.addEventListener("scroll", () => { updateJump(); }, { passive: true });

    function withAnchor(mutateFn) {
      const el = firstVisibleMsgEl();
      const before = el ? el.getBoundingClientRect().top : null;
      const wasStick = st().stickToBottom;
      mutateFn();
      if (wasStick) { scrollBottom(false); return; }
      if (el && before != null) {
        const now = streamEl.querySelector('[data-msgid="' + CSS.escape(el.dataset.msgid || el.dataset.firstid) + '"]');
        if (now) scrollerEl.scrollTop += now.getBoundingClientRect().top - before;
      }
    }

    function lensShape(msgId) {
      return store.lensShapeOf(msgId);
    }

    function messageBodyHtml(msg) {
      const collapsed = store.isLongCollapsed(msg);
      const shape = lensShape(msg.id);
      if (shape === "muted" || shape === "subcompacted") {
        const n = shape === "muted" ? PREVIEW_CHARS : SUBCOMPACT_CHARS;
        const preview = msg.body.length > n ? msg.body.slice(0, n).trimEnd() + "…" : msg.body;
        return '<div class="pmq-body pmq-body-shaped" data-shaped="' + shape + '">' +
          '<span class="pmq-shape-tag">' + (shape === "muted" ? "Muted" : "Subcompacted") + "</span>" +
          (window.PMChatMarkdown ? window.PMChatMarkdown.plainPreview(msg.body, n) : "<p>" + esc(preview) + "</p>") +
          '<button class="pmq-shape-clear" type="button">Show full message · clear ' + shape + "</button></div>";
      }
      if (collapsed) {
        const preview = msg.body.length > PREVIEW_CHARS ? msg.body.slice(0, PREVIEW_CHARS).trimEnd() + "…" : msg.body;
        return '<div class="pmq-body pmq-body-collapsed">' + (window.PMChatMarkdown ? window.PMChatMarkdown.plainPreview(msg.body) : fmt.bodyHtml(preview)) +
          '<button class="pmq-expand-ctl" type="button" data-expand><i data-ico="expand"></i>Full message hidden · expand</button></div>';
      }
      let html = '<div class="pmq-body">' + (window.PMChatMarkdown ? window.PMChatMarkdown.render(msg.body) : fmt.bodyHtml(msg.body));
      if (msg.collapsedByDefault) {
        html += '<button class="pmq-expand-ctl pmq-expand-hover" type="button" data-collapse><i data-ico="collapse"></i>Collapse long message</button>';
      }
      return html + "</div>";
    }

    function hoverRowHtml(msg, running) {
      const rt = msg.runtime || {};
      const items = [];
      items.push('<button class="pmq-hact" type="button" data-act="copy" title="Copy"><i data-ico="copy"></i><span>Copy</span></button>');
      items.push('<button class="pmq-hact" type="button" data-act="restore" title="Create restore point"><i data-ico="history"></i><span>Restore point</span></button>');
      items.push('<button class="pmq-hact" type="button" data-act="branch" title="Branch from here"><i data-ico="branch"></i><span>Branch</span></button>');
      if (msg.role === "user") {
        if (msg.eligibleForEdit && !msg.id.includes("-sent-")) {
          items.push('<button class="pmq-hact" type="button" data-act="edit" title="Edit"><i data-ico="edit"></i><span>Edit</span></button>');
        } else if (msg.eligibleForEdit) {
          items.push('<button class="pmq-hact" type="button" data-act="edit" title="Edit"><i data-ico="edit"></i><span>Edit</span></button>');
        }
      }
      items.push('<span class="pmq-hmeta">' + esc(rt.provider || "") + "</span>");
      items.push('<span class="pmq-hmeta">' + esc(rt.model || "") + "</span>");
      const worked = msg.stopped ? "Stopped after " + fmt.dur(rt.workedSeconds) : fmt.workedLabel(false, rt.workedSeconds || 0);
      items.push('<span class="pmq-hmeta pmq-hdur" data-dur-for="' + msg.id + '">' + esc(worked) + "</span>");
      items.push('<button class="pmq-hact pmq-hinfo" type="button" data-act="info" title="More Info" aria-label="More Info"><i data-ico="info"></i><span>More Info</span></button>');
      return '<div class="pmq-msg-hover">' + items.join("") + "</div>";
    }

    function moreInfoPopup(anchor, msg) {
      const rt = msg.runtime || {};
      const rows = [];
      const row = (k, v) => { if (v != null && v !== "") rows.push('<div class="pmq-mi-row"><span>' + k + "</span><b>" + esc(v) + "</b></div>"); };
      row("Message timestamp", fmt.fullStamp(msg.sentAt));
      row("Started", fmt.clockFull(msg.sentAt));
      if (msg.role === "assistant") row("Completed", fmt.clockFull(msg.sentAt));
      row("Worked for", fmt.dur(rt.workedSeconds));
      if (rt.totalElapsedSeconds != null && rt.totalElapsedSeconds !== rt.workedSeconds) row("Total elapsed", fmt.dur(rt.totalElapsedSeconds));
      row("Mode", rt.mode);
      row("Provider", rt.provider);
      row("Model", rt.model);
      row("Effort", rt.effort);
      row("Persona", rt.persona);
      row("Tokens", fmt.tokens(rt.tokenCount));
      row("Context use", fmt.context(rt.contextUsed, rt.contextLimit));
      row("Estimated cost", rt.estimatedCost != null ? fmt.cost(rt.estimatedCost) : "Plan usage");
      row("Turn identity", msg.id);
      if (msg.stopped) rows.push('<div class="pmq-mi-row pmq-mi-stopped"><span>Run state</span><b>Stopped by user</b></div>');
      const wrap = document.createElement("div");
      wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="info"></i>More Info</div><div class="pmq-popup-body">' + rows.join("") + "</div>";
      window.PMIcons.hydrate(wrap);
      const bodyEl = wrap.querySelector(".pmq-popup-body");
      const rps = store.thread(activeKey()).restorePoints;
      if (rps.length) {
        const head = document.createElement("div");
        head.className = "pmq-chats-group";
        head.textContent = "Restore points";
        bodyEl.appendChild(head);
        rps.forEach(rp => {
          const b = document.createElement("button");
          b.className = "pmq-menu-item";
          b.type = "button";
          b.innerHTML = '<i data-ico="rewind"></i><span>Rewind to ' + esc(fmt.ago(rp.at)) + "</span>";
          window.PMIcons.hydrate(b);
          b.addEventListener("click", () => { store.rewindTo(activeKey(), rp.id); env.popups.closeActive(); });
          bodyEl.appendChild(b);
        });
        if (store.thread(activeKey()).rewindAnchor) {
          const c = document.createElement("button");
          c.className = "pmq-menu-item";
          c.type = "button";
          c.innerHTML = '<i data-ico="jumpLatest"></i><span>Show later messages again</span>';
          window.PMIcons.hydrate(c);
          c.addEventListener("click", () => { store.rewindClear(activeKey()); env.popups.closeActive(); });
          bodyEl.appendChild(c);
        }
      }
      env.popups.open(anchor, wrap, { width: 290 });
    }

    function openBranchMenu(anchor, msg) {
      const key = activeKey();
      const s = store.effectiveSettings(key);
      env.popups.menu(anchor, [
        { label: "Branch from here", icon: "branch", sub: "Keeps this thread and its ancestry", onpick: () => { store.branchFrom(key, msg.id, {}); env.hostApi.toast("Branched · the source thread is untouched"); } },
        { label: "Branch with a different model", icon: "sparkle", sub: "Independent future settings", onpick: () => {
            const cat = store.catalog();
            const others = [];
            cat.forEach(p => p.models.forEach(m2 => { if (m2.name !== s.model) others.push({ label: m2.name + " · " + p.provider, icon: "sparkle", onpick: () => { const id = store.branchFrom(key, msg.id, { model: m2.name, switchTo: true }); if (id) store.setThreadSettings(id, { provider: p.provider, model: m2.name }); } }); }));
            env.popups.menu(anchor, others.slice(0, 8), { title: "Branch with model", width: 260 });
          } },
        { label: "Start new chat", icon: "chats", onpick: () => { const id = store.spawnRelated(key, "New chat", "Fresh conversation started from " + (store.demoThread(key) ? store.demoThread(key).title : key) + "."); store.switchThread(id); } }
      ], { title: "Branch from here", width: 280 });
    }

    function activityGroupHtml(msg) {
      const ag = msg.activityGroup;
      if (!ag) return "";
      const s = st();
      const open = s.expandedActivity.includes(ag.id);
      const stages = ag.stages.map(stg => {
        const ico = { thought: "sparkle", exploration: "search", import: "layers", edit: "edit", asset: "wand", completion: "check", read: "file", search: "search", web: "globe", test: "flask", verify: "check", fetch: "globe", browser: "globe", generate: "wand" }[stg.kind] || "activity";
        let extra = "";
        if (stg.kind === "edit" && stg.added != null) extra = '<span class="pmq-ag-add">+' + stg.added + '</span><span class="pmq-ag-del">−' + stg.removed + "</span>";
        else if (stg.count != null) extra = '<span class="pmq-ag-count">' + stg.count + (stg.kind === "asset" ? " items" : "") + "</span>";
        const items = stg.items && stg.items.length
          ? '<div class="pmq-ag-items">' + stg.items.map(i => '<span class="pmq-ag-item"><i data-ico="file"></i>' + esc(i) + "</span>").join("") + "</div>"
          : "";
        const summary = stg.summary ? '<div class="pmq-ag-summary">' + esc(stg.summary) + "</div>" : "";
        return '<div class="pmq-ag-stage pmq-tl-node">' +
          '<span class="pmq-ag-stage-head"><i data-ico="' + ico + '"></i><span class="pmq-ag-label">' + esc(stg.label) + "</span>" + extra +
          '<span class="pmq-ag-dur">' + fmt.dur(stg.durationSeconds) + "</span></span>" + summary + items + "</div>";
      }).join("");
      const draw = justOpened("ag:" + ag.id, open);
      /* Two-chip condense strip + persistent Verified row (video 03). */
      const tools = ag.stages.filter(x => x.kind !== "edit" && x.kind !== "completion" && x.kind !== "verify").reduce((n, x) => n + (x.count || 1), 0);
      const edits = ag.stages.filter(x => x.kind === "edit");
      const creates = edits.reduce((n, x) => n + (x.created || 0), 0);
      const editN = edits.length;
      const added = edits.reduce((n, x) => n + (x.added || 0), 0);
      const removed = edits.reduce((n, x) => n + (x.removed || 0), 0);
      const verify = ag.stages.find(x => x.kind === "verify" || x.kind === "completion" || x.kind === "test");
      const chips = '<span class="pmq-ag-chips">' +
        '<span class="pmq-ag-chip"><i data-ico="activity"></i>' + tools + " tools used</span>" +
        (editN ? '<span class="pmq-ag-chip"><i data-ico="edit"></i>Made ' + creates + " create" + (creates === 1 ? "" : "s") + ", " + editN + " edit" + (editN === 1 ? "" : "s") + ' <span class="pmq-ag-add">+' + added + '</span><span class="pmq-ag-del">−' + removed + "</span></span>" : "") +
        "</span>";
      const verified = verify ? '<div class="pmq-ag-verified"><i data-ico="check"></i><span>' + esc(verify.label || "Verified") + "</span></div>" : "";
      return '<div class="pmq-agroup' + (open ? " pmq-open" : "") + '" data-ag="' + ag.id + '">' +
        '<button class="pmq-ag-head" type="button" data-agtoggle aria-expanded="' + open + '">' +
        '<i data-ico="activity"></i><span class="pmq-ag-compact">' + esc(ag.compactLabel) + "</span>" + chips +
        '<span class="pmq-ag-worked">Worked for ' + fmt.dur(ag.workedSeconds) + "</span>" +
        '<i data-ico="' + (open ? "collapse" : "expand") + '" class="pmq-ag-chev"></i></button>' +
        verified +
        gridWrap(open, '<div class="pmq-ag-stages pmq-timeline' + (draw ? " pmq-tl-draw" : "") + '">' + stages + "</div>", null, "ag-" + ag.id) + "</div>";
    }

    function thoughtSegmentsHtml(msg) {
      const segs = msg.thoughtSegments;
      if (!segs || !segs.length) return "";
      const s = st();
      const keep = env.store.state.session.keepThoughtExpanded;
      return '<div class="pmq-thoughts">' + segs.map(seg => {
        let open = !seg.collapsed;
        if (seg.status === "active" && keep) open = true;
        if (s.expandedThoughts.includes(seg.id)) open = true;
        const active = seg.status === "active";
        const headIco = active ? orbitHtml("pmq-thought-orbit") : '<i data-ico="sparkle"></i>';
        return '<div class="pmq-thought' + (open ? " pmq-open" : "") + (active ? " pmq-thought-active" : "") + '" data-thought="' + seg.id + '">' +
          '<button class="pmq-thought-head" type="button" data-thoughttoggle aria-expanded="' + open + '">' +
          headIco + '<span>' + esc(seg.label) + "</span>" +
          '<span class="pmq-thought-state">' + (active ? "Thinking" : "Complete") + (active ? "" : checkSvg("pmq-thought-check")) + "</span>" +
          '<i data-ico="' + (open ? "collapse" : "expand") + '"></i></button>' +
          gridWrap(open, '<div class="pmq-thought-body">' + esc(seg.summary) + "</div>", null, "thought-" + seg.id) +
          "</div>";
      }).join("") + "</div>";
    }

    function completedQuestHtml(msg) {
      const cq = msg.completedQuestionnaire;
      if (!cq) return "";
      const s = st();
      const open = s.expandedByIds["cq:" + cq.id] === true;
      const qa = (cq.questions || []).map(q =>
        '<div class="pmq-cq-qa"><div class="pmq-cq-q">' + esc(q.prompt) + '</div><div class="pmq-cq-a">' +
        esc(q.kind === "freeform" ? (q.draft || "No note added") : (q.selected || []).join(", ") || "Skipped") + "</div></div>").join("");
      return '<div class="pmq-cquest' + (open ? " pmq-open" : "") + '" data-cq="' + cq.id + '">' +
        '<button class="pmq-cq-head" type="button" data-cqtoggle aria-expanded="' + open + '">' +
        '<i data-ico="question"></i><span>Questionnaire completed</span>' +
        '<span class="pmq-cq-state">' + esc(cq.status.charAt(0).toUpperCase() + cq.status.slice(1)) + "</span>" +
        '<i data-ico="' + (open ? "collapse" : "expand") + '"></i></button>' +
        gridWrap(open, '<div class="pmq-cq-body">' + qa + "</div>", null, "cq-" + cq.id) + "</div>";
    }

    function messageEl(msg, isWorking, prev) {
      const el = document.createElement("div");
      const shape = lensShape(msg.id);
      el.className = "pmq-msg pmq-" + msg.role +
        (store.isLongCollapsed(msg) ? " pmq-is-collapsed" : "") +
        (shape ? " pmq-lens-" + shape : "") +
        (msg.stopped ? " pmq-stopped" : "") +
        (opts.messageClass ? " " + opts.messageClass(msg) : "");
      el.dataset.msgid = msg.id;
      el.dataset.role = msg.role;

      const inner = document.createElement("div");
      inner.className = "pmq-msg-inner";
      inner.innerHTML = messageBodyHtml(msg) + thoughtSegmentsHtml(msg) + activityGroupHtml(msg) + completedQuestHtml(msg) + hoverRowHtml(msg, isWorking);
      el.appendChild(inner);
      window.PMIcons.hydrate(el);

      if (opts.decorate) opts.decorate(el, msg, { fmt, store, env, prevMsg: prev || null });
      return el;
    }

    function renderStream() {
      const key = activeKey();
      const s = st();
      const all = store.messages(key);
      const loadedAll = store.loadedMessages(key);
      let loaded = loadedAll;
      let rewindCut = 0;
      if (s.rewindAnchor) {
        const rIdx = loadedAll.findIndex(m => m.id === s.rewindAnchor);
        if (rIdx >= 0 && rIdx < loadedAll.length - 1) {
          loaded = loadedAll.slice(0, rIdx + 1);
          rewindCut = loadedAll.length - loaded.length;
        }
      }
      const prevAnchor = firstVisibleMsgEl();
      const anchorId = prevAnchor ? (prevAnchor.dataset.msgid || prevAnchor.dataset.firstid) : null;
      const anchorTop = prevAnchor ? prevAnchor.getBoundingClientRect().top : null;

      streamEl.innerHTML = "";

      const remaining = all.length - loaded.length;
      if (remaining > 0) {
        const older = document.createElement("button");
        older.className = "pmq-loadolder";
        older.type = "button";
        older.innerHTML = '<i data-ico="history"></i>Show older messages · ' + remaining + " more stored";
        window.PMIcons.hydrate(older);
        older.addEventListener("click", () => loadOlder(Math.min(40, remaining)));
        streamEl.appendChild(older);
      }

      let pendingGroup = null;
      let prevMsg = null;
      const maybeDaySep = msg => {
        if (!opts.daySeparators || !prevMsg) return;
        if (fmt.dayKey(prevMsg.sentAt) !== fmt.dayKey(msg.sentAt)) {
          const sep = document.createElement("div");
          sep.className = "pmq-daysep";
          sep.textContent = fmt.dayLabel(msg.sentAt);
          streamEl.appendChild(sep);
        }
      };
      const appendMsg = msg => {
        maybeDaySep(msg);
        const el = messageEl(msg, false, prevMsg);
        if (opts.groupSameRole && pendingGroup && pendingGroup.role === msg.role) {
          pendingGroup.el.appendChild(el);
          pendingGroup.count++;
          pendingGroup.head.querySelector(".pmq-group-n").textContent = pendingGroup.count + " messages";
          prevMsg = msg;
          return;
        }
        if (opts.groupSameRole) {
          const g = document.createElement("div");
          g.className = "pmq-msggroup pmq-" + msg.role;
          g.dataset.firstid = msg.id;
          g.innerHTML = '<div class="pmq-group-head"><span class="pmq-group-role">' +
            (msg.role === "user" ? "You" : "Assistant") + '</span><span class="pmq-group-n">1 message</span></div>';
          const holder = document.createElement("div");
          holder.className = "pmq-group-body";
          g.appendChild(holder);
          streamEl.appendChild(g);
          pendingGroup = { role: msg.role, el: holder, count: 1, head: g };
          holder.appendChild(el);
          prevMsg = msg;
          return;
        }
        streamEl.appendChild(el);
        prevMsg = msg;
      };

      if (opts.chapters) {
        let currentDay = null;
        let chapterEl = null;
        loaded.forEach(msg => {
          const day = fmt.dayKey(msg.sentAt);
          if (day !== currentDay) {
            currentDay = day;
            chapterEl = document.createElement("section");
            chapterEl.className = "pmq-chapter";
            chapterEl.dataset.day = day;
            const count = loaded.filter(m => fmt.dayKey(m.sentAt) === day).length;
            chapterEl.innerHTML = '<header class="pmq-chapter-head" data-chapterjump="' + day + '">' +
              '<i data-ico="calendar"></i><span>' + esc(fmt.dayLabel(msg.sentAt)) + "</span>" +
              '<span class="pmq-chapter-n">' + count + " messages</span></header>";
            const body = document.createElement("div");
            body.className = "pmq-chapter-body";
            chapterEl.appendChild(body);
            streamEl.appendChild(chapterEl);
            window.PMIcons.hydrate(chapterEl.querySelector("header"));
          }
          chapterEl.querySelector(".pmq-chapter-body").appendChild(messageEl(msg, false, null));
        });
      } else {
        loaded.forEach(appendMsg);
      }

      if (rewindCut > 0) {
        const div = document.createElement("div");
        div.className = "pmq-rewind-div";
        div.innerHTML = '<i data-ico="rewind"></i><span>Restored to an earlier point · ' + rewindCut + " later messages hidden</span>" +
          '<button class="pmq-btn" type="button" data-rewindshow>Show later messages</button>';
        window.PMIcons.hydrate(div);
        div.querySelector("button").addEventListener("click", () => store.rewindClear(key));
        streamEl.appendChild(div);
      }

      if (opts.surfacesPlacement !== "band") appendSurfaces(streamEl, key);

      workingCtl.sync(key);

      window.PMIcons.hydrate(streamEl);

      const nodes = streamEl.querySelectorAll(".pmq-msg[data-msgid]");
      const nextIds = new Set();
      const fresh = [];
      const now = Date.now();
      nodes.forEach(el => {
        const id = el.dataset.msgid;
        nextIds.add(id);
        if (firstPaint) return;
        if (!prevIds.has(id)) { fresh.push(el); return; }
        /* One user action can fire two synchronous ticks (send() mutates, then
           startRun() emits), and every tick rebuilds the stream wholesale — so
           the node we just entered is destroyed before its first painted frame.
           Re-enter its replacement when the original birth is inside a
           sub-frame window: still exactly one entrance per NEW message, and
           never a replay on a later tick (same keys past the window). */
        const born = enteredAt[id];
        if (born && enteredEl[id] !== el && now - born < 40) fresh.push(el);
      });
      if (fresh.length) {
        if (typeof opts.enterMsg === "function") {
          if (window.PMAnim && !window.PMAnim.reduced()) {
            fresh.forEach((el, i) => {
              enteredAt[el.dataset.msgid] = now;
              enteredEl[el.dataset.msgid] = el;
              try { opts.enterMsg(el, i, el.dataset.role || "assistant"); } catch (e) {}
            });
          } else {
            fresh.forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; });
          }
        } else if (!A.reduced()) {
          const users = fresh.filter(el => el.dataset.role === "user");
          const others = fresh.filter(el => el.dataset.role !== "user");
          A.staggerIn(others, { rise: 6, duration: 300, step: 30, cap: 220 });
          A.staggerIn(users, { rise: 14, duration: 340, step: 30, cap: 220 });
        }
      }
      prevIds = nextIds;
      firstPaint = false;
      animateStagger = false;
      Object.keys(enteredAt).forEach(id => {
        if (!nextIds.has(id)) { delete enteredAt[id]; delete enteredEl[id]; }
      });

      if (s.stickToBottom) {
        /* Spatial continuity (video 01): small arrivals glide; a multi-viewport
           catch-up stays instant so long jumps never swim. */
        const away = scrollerEl.scrollHeight - scrollerEl.scrollTop - scrollerEl.clientHeight;
        scrollBottom(away < 2 * scrollerEl.clientHeight);
      } else if (anchorId) {
        const el = streamEl.querySelector('[data-msgid="' + CSS.escape(anchorId) + '"], [data-firstid="' + CSS.escape(anchorId) + '"]');
        if (el && anchorTop != null) scrollerEl.scrollTop += el.getBoundingClientRect().top - anchorTop;
      }
      if (!s.stickToBottom && fresh.length) sweepNew(fresh.length);
      updateJump();
    }

    /* Header sweep (video 01): a theme-aware band sweeps when content arrives
       while the user is scrolled up. Reduced motion shows a static bar instead. */
    let sweepTimer = null;
    function sweepNew(n) {
      sweepEl.setAttribute("data-count", n + " new");
      root.classList.remove("pmq-sweeping");
      void sweepEl.offsetWidth;
      root.classList.add("pmq-sweeping");
      if (sweepTimer) clearTimeout(sweepTimer);
      sweepTimer = setTimeout(() => root.classList.remove("pmq-sweeping"), 1000);
    }

    /* Persistent working row: created ONCE on run start, removed on run end.
       Lives outside the per-tick renderStream rebuild so its orbit spinner,
       crossfading step text and timer persist across store ticks. */
    const workingCtl = {
      el: null,
      timer: null,
      runId: null,
      lastStep: null,
      lastDur: -1,
      build(run) {
        const el = document.createElement("div");
        el.className = "pmq-working";
        el.dataset.working = "1";
        const step = run.steps[Math.min(run.stepIndex, run.steps.length - 1)];
        el.innerHTML =
          '<span class="pmq-working-phases" data-phases aria-hidden="true"></span>' +
          orbitHtml("pmq-working-orbit") +
          '<span class="pmq-working-main">' +
          '<span class="pmq-working-textwrap"><span class="pmq-working-text">' + esc(step) + "</span></span>" +
          (run.redirected ? '<span class="pmq-working-redirect"><i data-ico="rewind"></i>' + esc(run.redirected) + "</span>" : "") +
          "</span>" +
          '<span class="pmq-working-dur">' + esc(fmt.workedLabel(true, store.workedSeconds(run))) + "</span>";
        window.PMIcons.hydrate(el);
        this.paintPhases(el, run);
        return el;
      },
      paintPhases(el, run) {
        const ph = el.querySelector("[data-phases]");
        if (!ph) return;
        const icons = ["sparkle", "search", "edit", "flask", "check"];
        let html = "";
        for (let i = 0; i < Math.min(run.stepIndex, 5); i++) {
          html += '<span class="pmq-wphase pmq-done"><i data-ico="' + icons[i % icons.length] + '"></i></span>';
        }
        html += '<span class="pmq-wphase pmq-now">' + orbitHtml("pmq-wphase-orbit") + "</span>";
        ph.innerHTML = html;
        window.PMIcons.hydrate(ph);
      },
      crossfadeText(cell, text) {
        if (!cell) return;
        if (window.PMAnim) { window.PMAnim.crossfadeNum(cell, text, { duration: 200, outDuration: 140 }); return; }
        cell.textContent = text;
      },
      sync(key) {
        const run = store.state.running;
        const active = !!(run && run.threadKey === key);
        if (!active) { this.teardown(); return; }
        const rid = run.threadKey + "@" + run.startedAt;
        if (!this.el || this.runId !== rid) {
          this.teardown();
          this.el = this.build(run);
          this.runId = rid;
          this.lastStep = run.steps[Math.min(run.stepIndex, run.steps.length - 1)];
          this.lastDur = store.workedSeconds(run);
          this.startTimer();
        } else {
          const step = run.steps[Math.min(run.stepIndex, run.steps.length - 1)];
          if (step !== this.lastStep) {
            this.lastStep = step;
            this.crossfadeText(this.el.querySelector(".pmq-working-text"), step);
            this.paintPhases(this.el, run);
          }
        }
        if (this.el.parentNode !== workingZone) workingZone.appendChild(this.el);
      },
      startTimer() {
        this.stopTimer();
        const self = this;
        this.timer = setInterval(() => {
          if (!self.el || !document.body.contains(self.el)) { self.teardown(); return; }
          const r = store.state.running;
          if (!r) { self.teardown(); return; }
          const dur = store.workedSeconds(r);
          if (dur !== self.lastDur) {
            self.lastDur = dur;
            const durEl = self.el.querySelector(".pmq-working-dur");
            if (durEl) { durEl.textContent = fmt.workedLabel(true, dur); A.pop(durEl); }
          }
        }, 500);
        intervals.push(this.timer);
      },
      stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },
      teardown() {
        this.stopTimer();
        if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
        this.el = null;
        this.runId = null;
        this.lastStep = null;
        this.lastDur = -1;
      }
    };

    function loadOlder(n) {
      const s = st();
      store.mutate(() => { s.loadedCount = Math.min(store.messages(activeKey()).length, s.loadedCount + n); });
    }

    function goalCard(key) {
      const t = store.demoThread(key);
      const status = store.goalEffectiveStatus(key);
      if (!status) return null;
      const g = t.activeGoal;
      const s = store.thread(key);
      const open = s.goalExpanded;
      const labels = { running: "Running", paused: "Paused", blocked: "Blocked", stopped: "Stopped", complete: "Complete" };
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-goal pmq-goal-" + status + (open ? " pmq-open" : "");
      el.dataset.surface = "goal";
      const blocker = status === "blocked" && g.blocker ? g.blocker : null;
      const frac = g.progress ? Math.max(0, Math.min(1, g.progress.complete / g.progress.total)) : 0;
      const glyphKind = status === "running" ? "running" : status === "paused" ? "paused" : status === "blocked" ? "blocked" : status === "complete" ? "complete" : "ready";
      const bodyInner = '<div class="pmq-goal-body">' +
        (s.replanCount > 0 ? '<div class="pmq-replan"><i data-ico="warn"></i>Material edit recorded · visible replan in progress</div>' : "") +
        '<div class="pmq-goal-objective" data-objlabel>' + esc(s.goalObjective || g.objective) + "</div>" +
        (g.progress ? '<div class="pmq-goal-progress"><span class="pmq-goal-bar"><span class="pmq-goal-fill" style="transform:scaleX(' + frac + ')"></span></span>' +
          '<span class="pmq-goal-ptext" data-goalptext>' + g.progress.complete + " of " + g.progress.total + " tasks · " + g.progress.subgoalsActive + " subgoals active</span></div>" : "") +
        (blocker ? '<div class="pmq-blocker"><div class="pmq-blocker-class">' + esc(blocker.blockerClass) + "</div>" +
          '<div class="pmq-blocker-row"><span>Cause</span><b>' + esc(blocker.cause) + "</b></div>" +
          '<div class="pmq-blocker-row"><span>Affected scope</span><b>' + esc(blocker.affectedScope) + "</b></div>" +
          '<div class="pmq-blocker-row"><span>Last recovery</span><b>' + esc(blocker.lastAttemptedRecovery) + "</b></div>" +
          '<div class="pmq-blocker-row"><span>Why recovery stopped</span><b>' + esc(blocker.whyRecoveryStopped) + "</b></div>" +
          '<div class="pmq-blocker-row"><span>Next safe action</span><b>' + esc(blocker.nextSafeAction) + "</b></div></div>" : "") +
        '<div class="pmq-goal-times"><span>Worked for ' + fmt.dur(g.workedSeconds) + "</span><span>Total elapsed " + fmt.dur(g.totalElapsedSeconds) + "</span></div>" +
        '<div class="pmq-goal-logs" hidden><div class="pmq-popup-head">Evidence and logs</div>' +
        '<div class="pmq-log-row">Goal created · objective committed</div>' +
        '<div class="pmq-log-row">Scheduler revision ' + (s.replanCount + 1) + " accepted</div>" +
        '<div class="pmq-log-row">Status now ' + (labels[status] || status) + "</div></div>" +
        "</div>";
      el.innerHTML = '<div class="pmq-surface-head">' +
        '<i data-ico="goal"></i><span class="pmq-surface-title">' + esc(g.title) + "</span>" +
        '<span class="pmq-goal-status" data-status="' + status + '">' + stateGlyph(glyphKind) + '<span class="pmq-goal-status-text">' + (labels[status] || status) + "</span></span>" +
        '<button class="pmq-surface-kebab pmq-btn pmq-btn-icon" type="button" data-goalmenu aria-label="Goal actions"><i data-ico="kebab"></i></button>' +
        "</div>" + gridWrap(open, bodyInner, "pmq-goal-wrap", "goal");
      window.PMIcons.hydrate(el);
      if (numChanged("goalstatus:" + key, status)) A.pop(el.querySelector(".pmq-goal-status"));
      el.querySelector("[data-goalmenu]").addEventListener("click", e => goalMenu(e.currentTarget, key));
      el.addEventListener("click", e => {
        if (e.target.closest("[data-goalmenu]")) return;
        const head = e.target.closest(".pmq-surface-head");
        if (head) toggleSurface("goal", () => store.goalAct(key, open ? "collapse" : "expand"));
      });
      return el;
    }

    function goalMenu(anchor, key) {
      const t = store.demoThread(key);
      const g = t.activeGoal;
      const status = store.goalEffectiveStatus(key);
      const items = [
        { label: "View goal", icon: "goal", onpick: () => store.goalAct(key, "expand") },
        { label: "Edit goal", icon: "edit", disabled: !g.canEdit, onpick: () => editGoal(key) },
        { sep: true },
        { label: "Pause", icon: "pause", disabled: !g.canPause || status !== "running", onpick: () => store.goalAct(key, "pause") },
        { label: "Resume", icon: "play", disabled: !g.canResume || status === "running", onpick: () => store.goalAct(key, "resume") },
        { label: "Stop", icon: "stop", disabled: !g.canStop || status === "stopped", onpick: () => store.goalAct(key, "stop") },
        { label: "Clear from thread", icon: "close", danger: true, disabled: !g.canClear, onpick: () => store.goalAct(key, "clear") },
        { sep: true },
        { label: "Show tasks", icon: "todo", onpick: () => { const s = store.thread(key); store.mutate(() => { s.todoCollapsed = false; s.goalExpanded = true; }); } },
        { label: "Show subgoals", icon: "graph", onpick: () => store.goalAct(key, "expand") },
        { label: "Show evidence and logs", icon: "history", onpick: () => {
          store.goalAct(key, "expand");
          setTimeout(() => {
            const logs = slotEl.querySelector(".pmq-goal-logs");
            if (logs) logs.hidden = false;
          }, 60);
        } }
      ];
      env.popups.menu(anchor, items, { title: "Goal", width: 250 });
    }

    function editGoal(key) {
      const t = store.demoThread(key);
      const s = store.thread(key);
      const current = s.goalObjective || t.activeGoal.objective;
      const anchor = slotEl.querySelector(".pmq-surface-kebab") || slotEl;
      const wrap = document.createElement("div");
      wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="edit"></i>Edit goal</div>' +
        '<div class="pmq-popup-body"><textarea class="pmq-goal-edit" rows="4" spellcheck="true">' + esc(current) + "</textarea>" +
        '<div class="pmq-goal-edit-note">A material edit triggers a visible replan.</div>' +
        '<div class="pmq-goal-edit-actions"><button class="pmq-btn" type="button" data-cancel>Cancel</button>' +
        '<button class="pmq-btn pmq-btn-primary" type="button" data-save>Save objective</button></div></div>';
      window.PMIcons.hydrate(wrap);
      const entry = env.popups.open(anchor, wrap, { width: 320 });
      wrap.querySelector("[data-cancel]").addEventListener("click", () => env.popups.dismiss(entry));
      wrap.querySelector("[data-save]").addEventListener("click", () => {
        store.goalSaveObjective(key, wrap.querySelector("textarea").value.trim() || current);
        env.popups.dismiss(entry);
        env.hostApi.toast("Objective saved · replan started");
      });
    }

    function todoCard(key) {
      const td = store.todoList(key);
      if (!td || !td.items.length) return null;
      const s = store.thread(key);
      const collapsed = s.todoCollapsed;
      const done = td.items.filter(i => i.state === "complete").length;
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-todo" + (collapsed ? " pmq-collapsed" : "");
      el.dataset.surface = "todo";
      const itemIco = { pending: "timer", verifying: "search", replanned: "warn", blocked: "warn" };
      const newlyComplete = [];
      const itemsHtml = td.items.map((i, idx) => {
        const sig = key + "::" + i.id;
        let ico;
        if (i.state === "complete") {
          const was = seenTodoComplete.has(sig);
          if (!was) newlyComplete.push(idx);
          ico = checkSvg("pmq-todo-check", !was && !A.reduced());
        } else {
          seenTodoComplete.delete(sig);
          ico = i.state === "running" ? orbitHtml("pmq-todo-orbit") : '<i data-ico="' + (itemIco[i.state] || "timer") + '"></i>';
        }
        return '<button class="pmq-todo-item" type="button" data-state="' + i.state + '" data-tidx="' + idx + '" data-tid="' + esc(i.id) + '" title="Toggle complete" aria-label="Toggle ' + esc(i.label) + '">' +
          '<span class="pmq-todo-ico">' + ico + '</span>' +
          '<span class="pmq-todo-label">' + esc(i.label) + "</span>" +
          (i.state === "replanned" ? '<span class="pmq-todo-replanned">Replanned</span>' : "") +
          (i.state === "blocked" ? '<span class="pmq-todo-replanned">Blocked</span>' : "") + "</button>";
      }).join("");
      td.items.forEach(i => { if (i.state === "complete") seenTodoComplete.add(key + "::" + i.id); });
      el.innerHTML = '<button class="pmq-surface-head" type="button" data-todotoggle aria-expanded="' + !collapsed + '">' +
        '<i data-ico="todo"></i><span class="pmq-surface-title">Tasks</span>' +
        '<span class="pmq-todo-count" data-todo-count>' + done + " of " + td.items.length + " complete</span>" +
        '<i data-ico="' + (collapsed ? "expand" : "collapse") + '"></i></button>' +
        gridWrap(!collapsed, '<div class="pmq-todo-body">' + itemsHtml +
        '<div class="pmq-todo-addrow"><button class="pmq-todo-add" type="button" data-todoadd><i data-ico="plus"></i>Add task</button></div>' +
        "</div>", "pmq-todo-wrap", "todo");
      window.PMIcons.hydrate(el);
      el.querySelectorAll("[data-tid]").forEach(b => {
        b.addEventListener("click", e => {
          e.stopPropagation();
          const it = td.items.find(x => x.id === b.dataset.tid);
          if (!it) return;
          store.todoSetState(key, it.id, it.state === "complete" ? (it.prevState || "pending") : "complete");
        });
      });
      const addBtn = el.querySelector("[data-todoadd]");
      if (addBtn) addBtn.addEventListener("click", e => {
        e.stopPropagation();
        todoAddPopup(e.currentTarget, key);
      });
      if (!collapsed && newlyComplete.length) {
        newlyComplete.forEach(idx => {
          const row = el.querySelector('[data-tidx="' + idx + '"]');
          if (!row) return;
          A.pop(row.querySelector(".pmq-todo-ico"));
          A.strike(row.querySelector(".pmq-todo-label"));
        });
      }
      if (justOpened("todo:" + key, !collapsed)) A.staggerIn(el.querySelectorAll(".pmq-todo-item"), { rise: 8, step: 28, cap: 220 });
      const countCell = el.querySelector("[data-todo-count]");
      if (countCell && numChanged("todocount:" + key, done)) A.crossfadeNum(countCell, done + " of " + td.items.length + " complete");
      el.querySelector("[data-todotoggle]").addEventListener("click", () => toggleSurface("todo", () => store.mutate(() => { s.todoCollapsed = !s.todoCollapsed; })));
      return el;
    }

    function todoAddPopup(anchor, key) {
      const wrap = document.createElement("div");
      wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="plus"></i>Add task</div>' +
        '<div class="pmq-popup-body"><textarea class="pmq-goal-edit" rows="2" spellcheck="true" placeholder="Task label"></textarea>' +
        '<div class="pmq-goal-edit-actions"><button class="pmq-btn" type="button" data-cancel>Cancel</button>' +
        '<button class="pmq-btn pmq-btn-primary" type="button" data-save>Add</button></div></div>';
      window.PMIcons.hydrate(wrap);
      const entry = env.popups.open(anchor, wrap, { width: 300 });
      wrap.querySelector("[data-cancel]").addEventListener("click", () => env.popups.dismiss(entry));
      wrap.querySelector("[data-save]").addEventListener("click", () => {
        const v = wrap.querySelector("textarea").value.trim();
        if (v) store.todoAdd(key, v);
        env.popups.dismiss(entry);
      });
    }

    function subagentCards(key) {
      const groups = store.subagentGroups(key);
      if (!groups || !groups.length) return [];
      const s = store.thread(key);
      return groups.map(g => {
        const open = s.expandedSubagents.includes(g.id);
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-subagents" + (open ? " pmq-open" : "");
        el.dataset.surface = "subagents";
        const counts = [];
        const live = g.agents.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {});
        const c = g.counts || { working: live.running || live.working || 0, complete: live.complete || 0, blocked: live.blocked || 0, waiting: (live.waiting || 0) + (live.queued || 0) };
        if (c.working) counts.push(c.working + " working");
        if (c.complete) counts.push(c.complete + " complete");
        if (c.blocked) counts.push(c.blocked + " blocked");
        if (c.waiting) counts.push(c.waiting + " waiting");
        if (live.queued) counts.push(live.queued + " queued");
        if (live.failed || live.retrying) counts.push((live.failed || 0) + (live.retrying || 0) + " failed/retrying");
        const agentsHtml = g.agents.map((a, i) => {
          const running = a.status === "running" || a.status === "working";
          const actIco = running ? orbitHtml("pmq-sg-orbit") : (a.status === "complete" ? checkSvg("pmq-sg-check") : '<i data-ico="activity"></i>');
          const glyph = stateGlyph(running ? "running" : a.status === "complete" ? "complete" : a.status === "blocked" ? "blocked" : "attention");
          return '<button class="pmq-sg-agent" type="button" data-agent="' + i + '" data-status="' + a.status + '">' +
            '<span class="pmq-sg-top"><b>' + esc(a.name) + '</b><span class="pmq-sg-status" data-status="' + a.status + '">' + glyph +
            '<span>' + esc(a.status.charAt(0).toUpperCase() + a.status.slice(1)) + "</span></span></span>" +
            '<span class="pmq-sg-task">' + esc(a.task) + "</span>" +
            '<span class="pmq-sg-activity">' + actIco + esc(a.currentActivity) + '</span>' +
            '<span class="pmq-sg-dur">Worked for ' + fmt.dur(a.workedSeconds) + "</span></button>";
        }).join("");
        el.innerHTML = '<button class="pmq-surface-head" type="button" data-sgtoggle aria-expanded="' + open + '">' +
          '<i data-ico="agents"></i><span class="pmq-surface-title">' + esc(g.label) + "</span>" +
          '<span class="pmq-sg-counts" data-sgcounts>' + counts.join(" · ") + "</span>" +
          '<i data-ico="' + (open ? "collapse" : "expand") + '"></i></button>' +
          gridWrap(open, '<div class="pmq-sg-body">' + agentsHtml + "</div>", "pmq-sg-wrap", "sg-" + g.id);
        window.PMIcons.hydrate(el);
        if (justOpened("sg:" + key + ":" + g.id, open)) A.staggerIn(el.querySelectorAll(".pmq-sg-agent"), { rise: 9, step: 32, cap: 240 });
        el.querySelectorAll(".pmq-sg-agent").forEach(ag => {
          ag.addEventListener("pointermove", e => {
            if (A.reduced()) return;
            const r = ag.getBoundingClientRect();
            const dx = ((e.clientX - r.left) / r.width - 0.5) * 3;
            const dy = ((e.clientY - r.top) / r.height - 0.5) * -3;
            ag.style.transform = "translateY(-1px) rotateX(" + dy + "deg) rotateY(" + dx + "deg)";
          });
          ag.addEventListener("pointerleave", () => { ag.style.transform = ""; });
        });
        el.querySelector("[data-sgtoggle]").addEventListener("click", () => toggleSurface("sg-" + g.id, () => store.mutate(() => {
          const i = s.expandedSubagents.indexOf(g.id);
          if (i >= 0) s.expandedSubagents.splice(i, 1); else s.expandedSubagents.push(g.id);
        })));
        el.querySelectorAll("[data-agent]").forEach(b => {
          b.addEventListener("click", () => {
            const a = g.agents[+b.dataset.agent];
            const wrap = document.createElement("div");
            wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="agents"></i>' + esc(a.name) + "</div>" +
              '<div class="pmq-popup-body">' +
              '<div class="pmq-mi-row"><span>Task</span><b>' + esc(a.task) + "</b></div>" +
              '<div class="pmq-mi-row"><span>Current activity</span><b>' + esc(a.currentActivity) + "</b></div>" +
              '<div class="pmq-mi-row"><span>Status</span><b>' + esc(a.status.charAt(0).toUpperCase() + a.status.slice(1)) + "</b></div>" +
              '<div class="pmq-mi-row"><span>Worked for</span><b>' + fmt.dur(a.workedSeconds) + "</b></div>" +
              (a.status === "waiting for parent" ? '<div class="pmq-sg-route"><i data-ico="question"></i>Child questions route through this parent conversation. The child agent does not ask you directly.</div>' : "") +
              '<button class="pmq-menu-item" type="button" data-fulldetails><i data-ico="editorOpen"></i><span>Open full details in editor tab</span></button>' +
              "</div>";
            window.PMIcons.hydrate(wrap);
            const entry = env.popups.open(b, wrap, { width: 300 });
            wrap.querySelector("[data-fulldetails]").addEventListener("click", () => {
              env.hostApi.openEditorTab({ id: "subagent-" + g.id + "-" + b.dataset.agent, title: a.name + " · run details", kind: "document", detail: a.task });
              env.popups.dismiss(entry);
            });
          });
        });
        return el;
      });
    }

    function diffCards(key) {
      const groups = store.diffGroups(key);
      if (!groups || !groups.length) return [];
      const s = store.thread(key);
      return groups.map(g => {
        const open = s.expandedByIds["diff:" + g.id] === true;
        const adds = g.files.reduce((n, f) => n + f.added, 0);
        const dels = g.files.reduce((n, f) => n + f.removed, 0);
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-diff" + (open ? " pmq-open" : "");
        el.dataset.surface = "diff";
        const filesHtml = g.files.map(f =>
          '<div class="pmq-diff-file"><i data-ico="file"></i><span class="pmq-diff-path">' + esc(f.path) + "</span>" +
          '<span class="pmq-diff-add">+' + f.added + '</span><span class="pmq-diff-del">−' + f.removed + "</span>" +
          '<span class="pmq-diff-status">' + esc(f.status.charAt(0).toUpperCase() + f.status.slice(1)) + "</span></div>").join("");
        el.innerHTML = '<button class="pmq-surface-head" type="button" data-difftoggle aria-expanded="' + open + '">' +
          '<i data-ico="diff"></i><span class="pmq-surface-title">' + esc(g.label) + "</span>" +
          '<span class="pmq-diff-totals"><span class="pmq-diff-add" data-diffadd>+' + adds + '</span><span class="pmq-diff-del" data-diffdel>−' + dels + "</span></span>" +
          (g.hiddenFileCount ? '<span class="pmq-diff-hidden">' + g.hiddenFileCount + " more files</span>" : "") +
          '<i data-ico="' + (open ? "collapse" : "expand") + '"></i></button>' +
          gridWrap(open, '<div class="pmq-diff-body">' + filesHtml +
          '<div class="pmq-diff-openrow"><button class="pmq-btn" type="button" data-diffopen><i data-ico="layers"></i>Open in left workspace</button></div>' +
          "</div>", "pmq-diff-wrap", "diff-" + g.id);
        window.PMIcons.hydrate(el);
        const dOpen = el.querySelector("[data-diffopen]");
        if (dOpen) dOpen.addEventListener("click", e => {
          e.stopPropagation();
          openDiffInWorkspace(key, g);
        });
        if (justOpened("diff:" + key + ":" + g.id, open)) A.staggerIn(el.querySelectorAll(".pmq-diff-file"), { rise: 6, step: 26, cap: 220 });
        const addCell = el.querySelector("[data-diffadd]");
        const delCell = el.querySelector("[data-diffdel]");
        if (addCell && numChanged("diffadd:" + key + ":" + g.id, adds)) A.crossfadeNum(addCell, "+" + adds);
        if (delCell && numChanged("diffdel:" + key + ":" + g.id, dels)) A.crossfadeNum(delCell, "−" + dels);
        el.querySelector("[data-difftoggle]").addEventListener("click", () => toggleSurface("diff-" + g.id, () => store.mutate(() => {
          s.expandedByIds["diff:" + g.id] = !open;
        })));
        return el;
      });
    }

    function openDiffInWorkspace(key, g) {
      const s = store.thread(key);
      let art = store.threadArtifacts(key).find(x => x.id === "art-" + g.id);
      if (!art) {
        art = { id: "art-" + g.id, title: g.label, kind: "multi_file_diff", files: g.files, projectPath: (store.demoThread(key) || {}).project || "Tastebook" };
        store.mutate(() => { s.extraArtifacts.push(art); });
      }
      const winId = env.winId ? env.winId() : "w1";
      store.artSetStatus(key, art.id, "loading", false);
      store.artOpen(winId, art.id);
    }

    function artifactCards(key) {
      const arts = store.threadArtifacts(key);
      const t = store.demoThread(key);
      const cards = [];
      if (arts.length) {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-artifacts";
        el.dataset.surface = "artifacts";
        el.innerHTML = '<div class="pmq-surface-head pmq-surface-head-static"><i data-ico="layers"></i><span class="pmq-surface-title">Artifacts</span>' +
          '<span class="pmq-sg-counts">' + arts.length + " in project</span></div>" +
          '<div class="pmq-art-body">' + arts.map((a, i) => {
            const stt = store.artStatusOf(key, a.id);
            return '<div class="pmq-art-row" data-artstatus="' + stt + '"><i data-ico="' + (window.PMChatWindowKit ? window.PMChatWindowKit.artIcon(a) : "file") + '"></i>' +
            '<span class="pmq-art-main"><b>' + esc(a.title) + '</b><span class="pmq-art-path">' + esc(a.projectPath || "") + "</span></span>" +
            (stt !== "ready" ? '<span class="pmq-chip pmq-chip-accent">' + esc(stt) + "</span>" : '<span class="pmq-chip">' + esc((a.kind || "document").charAt(0).toUpperCase() + (a.kind || "document").slice(1)) + "</span>") +
            '<button class="pmq-btn" type="button" data-art="' + i + '"><i data-ico="layers"></i>Open</button>' +
            '<button class="pmq-btn pmq-btn-icon" type="button" data-arttab="' + i + '" aria-label="Open in editor tab" title="Open in editor tab"><i data-ico="editorOpen"></i></button></div>';
          }).join("") + "</div>";
        window.PMIcons.hydrate(el);
        if (justOpened("art:" + key, true)) A.staggerIn(el.querySelectorAll(".pmq-art-row"), { rise: 8, step: 30, cap: 220 });
        el.querySelectorAll("[data-art]").forEach(b => {
          b.addEventListener("click", () => {
            const a = arts[+b.dataset.art];
            const row = b.closest(".pmq-art-row");
            A.pop(row);
            const winId = env.winId ? env.winId() : "w1";
            if (store.artStatusOf(key, a.id) === "error") store.artSetStatus(key, a.id, "loading", false);
            store.artOpen(winId, a.id);
          });
        });
        el.querySelectorAll("[data-arttab]").forEach(b => {
          b.addEventListener("click", () => {
            const a = arts[+b.dataset.arttab];
            const row = b.closest(".pmq-art-row");
            flyToTab(row);
            env.hostApi.openEditorTab({ id: a.id, title: a.title, kind: a.kind || "document", detail: a.projectPath });
          });
        });
        cards.push(el);
      }
      if (t.browserSessions && t.browserSessions.length) {
        t.browserSessions.forEach(bs => {
          const el = document.createElement("div");
          el.className = "pmq-surface pmq-browser";
          el.dataset.surface = "browser";
          el.innerHTML = '<div class="pmq-surface-head pmq-surface-head-static"><i data-ico="globe"></i><span class="pmq-surface-title">' + esc(bs.title) + '</span><span class="pmq-chip">Browser Program</span>' +
            '<span class="pmq-chip pmq-chip-accent">' + esc(bs.status.charAt(0).toUpperCase() + bs.status.slice(1)) + "</span></div>" +
            '<div class="pmq-art-body"><div class="pmq-art-row"><i data-ico="globe"></i>' +
            '<span class="pmq-art-main"><b>' + esc(bs.currentPage) + '</b><span class="pmq-art-path">' + bs.pagesVisited + " pages visited · " + bs.screenshots + " screenshots</span></span>" +
            '<button class="pmq-btn" type="button" data-bs><i data-ico="editorOpen"></i>Open in editor tab</button></div></div>';
          window.PMIcons.hydrate(el);
          el.querySelector("[data-bs]").addEventListener("click", ev => {
            const row = ev.currentTarget.closest(".pmq-art-row");
            flyToTab(row);
            A.pop(row);
            env.hostApi.openEditorTab({ id: bs.id, title: bs.title, kind: "browser capture", detail: bs.currentPage });
          });
          cards.push(el);
        });
      }
      return cards;
    }

    function questRecordCards(key) {
      const s = store.thread(key);
      const records = store.questRecords(key);
      return records.map(q => {
        const cancelled = s.questCancelled.includes(q.id);
        const open = s.expandedByIds["qr:" + q.id] === true;
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-questrecord" + (open ? " pmq-open" : "");
        el.dataset.surface = "questrecord";
        const qa = q.questions.map(x =>
          '<div class="pmq-cq-qa"><div class="pmq-cq-q">' + esc(x.prompt) + '</div><div class="pmq-cq-a">' +
          esc(storeAnswerText(q, x)) + "</div></div>").join("");
        el.innerHTML = '<button class="pmq-surface-head" type="button" data-qrtoggle aria-expanded="' + open + '">' +
          '<i data-ico="question"></i><span class="pmq-surface-title">' + (cancelled ? "Questionnaire cancelled" : "Questionnaire completed") + "</span>" +
          '<span class="pmq-sg-counts">' + q.questions.length + " questions</span>" +
          '<i data-ico="' + (open ? "collapse" : "expand") + '"></i></button>' +
          gridWrap(open, '<div class="pmq-cq-body">' + qa + "</div>");
        window.PMIcons.hydrate(el);
        el.querySelector("[data-qrtoggle]").addEventListener("click", () => store.mutate(() => { s.expandedByIds["qr:" + q.id] = !open; }));
        return el;
      });
    }

    function storeAnswerText(q, x) {
      const s = store.thread(activeKey());
      const answers = (s.questAnswers || {})[q.id] || {};
      const a = answers[x.id];
      if (a) return x.kind === "freeform" ? (a.draft || "No note added") : (a.selected.join(", ") || "Skipped");
      return x.kind === "freeform" ? (x.draft || "No note added") : ((x.selected || []).join(", ") || "Skipped");
    }

    function approvalCards(key) {
      const s = store.thread(key);
      return (s.approvals || []).filter(a => !a.resolved || a.resolved === "details-open").map(a => {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-approval";
        el.dataset.surface = "approval";
        const open = s.expandedByIds["ap:" + a.id] === true;
        const details = (a.details || []).map(d => '<div class="pmq-mi-row"><span>' + esc(d.k) + "</span><b>" + esc(d.v) + "</b></div>").join("");
        el.innerHTML = '<div class="pmq-ap-head"><i data-ico="shield"></i>' +
          '<span class="pmq-ap-q">' + esc(a.question) + "</span></div>" +
          '<div class="pmq-ap-scope">' + esc(a.scope || "") + "</div>" +
          '<div class="pmq-ap-actions">' +
          '<button class="pmq-btn" type="button" data-apact="deny">Deny</button>' +
          '<button class="pmq-btn" type="button" data-apact="allow-once">Allow once</button>' +
          '<button class="pmq-btn" type="button" data-apact="allow-session">Allow for session</button>' +
          '<button class="pmq-btn pmq-btn-icon" type="button" data-apdetails aria-expanded="' + open + '" aria-label="Details"><i data-ico="info"></i></button>' +
          "</div>" +
          gridWrap(open, '<div class="pmq-ap-details">' + (details || '<div class="pmq-mi-row"><span>Scope</span><b>Workspace only</b></div>') + '<div class="pmq-ap-safer">Safer alternative: ' + esc(a.safer || "run sandboxed with the same arguments") + "</div></div>", "pmq-ap-wrap", "ap-" + a.id);
        window.PMIcons.hydrate(el);
        el.querySelectorAll("[data-apact]").forEach(b => b.addEventListener("click", () => store.approvalResolve(key, a.id, b.dataset.apact)));
        el.querySelector("[data-apdetails]").addEventListener("click", () => {
          store.approvalDetails(key, a.id);
          toggleSurface("ap-" + a.id, () => store.mutate(() => {
            s.expandedByIds["ap:" + a.id] = !open;
          }));
        });
        return el;
      }).concat((s.approvals || []).filter(a => a.resolved && a.resolved !== "details-open").map(a => {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-approval pmq-approval-done";
        el.dataset.surface = "approval";
        el.innerHTML = '<div class="pmq-ap-head"><i data-ico="check"></i><span class="pmq-ap-q">' + esc(a.question) + '</span><span class="pmq-ap-res">' + esc(a.resolved.replace(/-/g, " ")) + "</span></div>";
        window.PMIcons.hydrate(el);
        return el;
      }));
    }

    function warningCards(key) {
      const s = store.thread(key);
      return (s.warnings || []).filter(w => !w.resolved && w.kind !== "cross-project" && !(w.kind === "capacity" && w.forecast)).map(w => {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-warning pmq-warning-" + (w.tier || "confirm");
        el.dataset.surface = "warning";
        const open = s.expandedByIds["wr:" + w.id] === true;
        const choices = w.choices || ["Continue here", "Switch", "Cancel"];
        el.innerHTML = '<div class="pmq-wr-head"><i data-ico="warn"></i><span class="pmq-wr-text">' + esc(w.text) + "</span>" +
          '<button class="pmq-btn pmq-btn-icon" type="button" data-wrdetails aria-expanded="' + open + '" aria-label="Details"><i data-ico="info"></i></button></div>' +
          gridWrap(open, '<div class="pmq-wr-details">' + esc(w.detail || "") + "</div>", "pmq-wr-wrap", "wr-" + w.id) +
          '<div class="pmq-wr-actions">' + choices.map(c2 => '<button class="pmq-btn' + (c2 === choices[0] ? " pmq-btn-primary" : "") + '" type="button" data-wract="' + esc(c2) + '">' + esc(c2) + "</button>").join("") + "</div>";
        window.PMIcons.hydrate(el);
        el.querySelector("[data-wrdetails]").addEventListener("click", () => toggleSurface("wr-" + w.id, () => store.mutate(() => {
          s.expandedByIds["wr:" + w.id] = !open;
        })));
        el.querySelectorAll("[data-wract]").forEach(b => b.addEventListener("click", () => warningAction(key, w, b.dataset.wract)));
        return el;
      });
    }

    function warningAction(key, w, action) {
      if (w.kind === "route" && w.pending) {
        if (action === "Switch here") { store.applyModelChange(key, w.pending); store.warningResolve(key, w.id, "switched"); return; }
        if (action === "Branch with this model") {
          const id = store.branchFrom(key, null, { model: w.pending.model, switchTo: true });
          if (id) store.setThreadSettings(id, { provider: w.pending.provider, model: w.pending.model });
          store.warningResolve(key, w.id, "branched");
          return;
        }
        if (action === "Start new chat") {
          const id = store.spawnRelated(key, "New chat · " + w.pending.model, "Fresh conversation on " + w.pending.model + ".");
          store.switchThread(id);
          store.warningResolve(key, w.id, "new-chat");
          return;
        }
        store.warningResolve(key, w.id, "cancelled");
        return;
      }
      if (w.kind === "attachment" && w.pendingAttach) {
        if (action === "Consent once") {
          store.attachSetRoute(key, w.pendingAttach, "alternate", true);
          store.attachResolve(w.pendingAttach, "alternate");
          store.attachConsentAlternate(w.pendingAttach, w.pendingTarget || "Gemini");
        } else if (action === "Extract in PM") {
          store.attachResolve(w.pendingAttach, "pm-transformed");
          store.attachStartJob(key, w.pendingAttach, "Transcript and frames extracted by PM");
        } else if (action === "Use Gemini") {
          store.warningInject(key, { tier: "confirm", kind: "attachment", text: "Route the original to an alternate model?", detail: "Consent is required once; PM keeps the lineage from the original attachment.", pendingAttach: w.pendingAttach, pendingTarget: "Gemini", choices: ["Cancel", "Consent once"] });
          store.warningResolve(key, w.id, "consent-requested");
          return;
        }
        store.warningResolve(key, w.id, action === "Consent once" ? "consented" : action === "Extract in PM" ? "extracted" : "cancelled");
        return;
      }
      if (action === "Open Settings") { env.hostApi.toast("Settings is owned by the full application"); store.warningResolve(key, w.id, "settings"); return; }
      if (action === "Cancel") { store.warningResolve(key, w.id, "cancelled"); return; }
      store.warningResolve(key, w.id, action.toLowerCase().replace(/\s+/g, "-"));
    }

    function crewCard(key) {
      const crew = store.crewOf(key);
      if (!crew) return null;
      const s = store.thread(key);
      const open = s.expandedByIds["crew"] === true;
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-crew" + (open ? " pmq-open" : "");
      el.dataset.surface = "crew";
      const members = (crew.members || []).map(m2 =>
        '<div class="pmq-crew-row"><span class="pmq-crew-role">' + esc(m2.role) + '</span><span class="pmq-crew-route">' + esc(m2.route) + "</span>" +
        '<span class="pmq-crew-state" data-st="' + esc(m2.state) + '">' + esc(m2.state) + "</span></div>").join("");
      el.innerHTML = '<button class="pmq-surface-head" type="button" data-crewtoggle aria-expanded="' + open + '">' +
        '<i data-ico="agents"></i><span class="pmq-surface-title">' + esc(crew.title || "Crew") + "</span>" +
        '<span class="pmq-sg-counts">' + esc(crew.summary || "") + "</span>" +
        '<i data-ico="' + (open ? "collapse" : "expand") + '"></i></button>' +
        gridWrap(open, '<div class="pmq-crew-body">' + members +
        (crew.note ? '<div class="pmq-crew-note">' + esc(crew.note) + "</div>" : "") + "</div>", "pmq-crew-wrap", "crew");
      window.PMIcons.hydrate(el);
      el.querySelector("[data-crewtoggle]").addEventListener("click", () => toggleSurface("crew", () => store.mutate(() => {
        s.expandedByIds["crew"] = !open;
      })));
      return el;
    }

    /* ---- v3 surfaces: grant, capacity forecast, BSD, operational, attachment
       resolution, and durable event receipts ---- */

    function grantCard(key) {
      const s = store.thread(key);
      const w = (s.warnings || []).find(x => x.kind === "cross-project" && !x.resolved);
      if (!w) return null;
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-grant";
      el.dataset.surface = "grant";
      el.innerHTML = '<div class="pmq-grant-head"><i data-ico="shield"></i><span class="pmq-surface-title">Cross-project access</span></div>' +
        '<div class="pmq-grant-text">' + esc(w.text) + "</div>" +
        '<div class="pmq-grant-rw"><span class="pmq-grant-r"><i data-ico="eye"></i>Read · ' + esc(w.projectRead || "another project") + '</span>' +
        '<span class="pmq-grant-w"><i data-ico="edit"></i>Modify · ' + esc(w.projectWrite || "target project") + "</span></div>" +
        '<div class="pmq-grant-note">One-time scopes never persist; the choice resets after the run.</div>' +
        '<div class="pmq-grant-actions">' +
        '<button class="pmq-btn" type="button" data-grant="Cancel">Cancel</button>' +
        '<button class="pmq-btn" type="button" data-grant="Allow once">Allow once</button>' +
        '<button class="pmq-btn pmq-btn-primary" type="button" data-grant="Allow for this Goal">Allow for this Goal</button>' +
        '<button class="pmq-btn" type="button" data-grant="Open Settings">Open Settings</button>' +
        "</div>";
      window.PMIcons.hydrate(el);
      el.querySelectorAll("[data-grant]").forEach(b => b.addEventListener("click", () => warningAction(key, w, b.dataset.grant)));
      return el;
    }

    function capacityCards(key) {
      const s = store.thread(key);
      return (s.warnings || []).filter(w => w.kind === "capacity" && w.forecast && !w.resolved).map(w => {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-capacity";
        el.dataset.surface = "capacity";
        const f = w.forecast;
        el.innerHTML = '<div class="pmq-cap-head"><i data-ico="agents"></i><span class="pmq-surface-title">Capacity forecast</span><span class="pmq-chip">forecast · not guarantee</span></div>' +
          '<div class="pmq-cap-row"><span>Requested specialists</span><b>' + f.requested + "</b></div>" +
          '<div class="pmq-cap-row"><span>Recommended concurrent</span><b>' + f.recommended + "</b></div>" +
          '<div class="pmq-cap-row"><span>Waves</span><b>' + f.waves + "</b></div>" +
          '<div class="pmq-cap-reason">Reason: ' + esc(f.reason) + "</div>" +
          '<div class="pmq-cap-note">Required independent roles cannot be dropped.</div>' +
          '<div class="pmq-cap-actions"><button class="pmq-btn pmq-btn-primary" type="button" data-cap="Start waves">Start waves</button>' +
          '<button class="pmq-btn" type="button" data-cap="Cancel">Cancel</button></div>';
        window.PMIcons.hydrate(el);
        el.querySelectorAll("[data-cap]").forEach(b => b.addEventListener("click", () => warningAction(key, w, b.dataset.cap)));
        return el;
      });
    }

    function bsdCards(key) {
      const s = store.thread(key);
      const t = store.demoThread(key) || {};
      const els = [];
      if (s.bsdAdvice) {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-bsd-advice";
        el.dataset.surface = "bsd";
        el.innerHTML = '<div class="pmq-bsd-head"><i data-ico="sparkle"></i><span class="pmq-surface-title">Back Seat Driver suggestion</span></div>' +
          '<div class="pmq-bsd-text">' + esc(s.bsdAdvice.text) + "</div>" +
          '<div class="pmq-bsd-actions"><button class="pmq-btn" type="button" data-bsdact="dismiss">Dismiss</button>' +
          '<button class="pmq-btn pmq-btn-primary" type="button" data-bsdact="apply">Apply to next turn</button></div>';
        window.PMIcons.hydrate(el);
        el.querySelector('[data-bsdact="dismiss"]').addEventListener("click", () => store.bsdAdviceDismiss(key));
        el.querySelector('[data-bsdact="apply"]').addEventListener("click", () => { store.bsdAdviceDismiss(key); env.hostApi.toast("Suggestion will shape the next turn"); });
        els.push(el);
      }
      const bsd = store.bsdEffective(key);
      if (bsd.state === "timeout" || bsd.state === "unavailable") {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-bsd-note";
        el.dataset.surface = "bsd";
        el.innerHTML = '<div class="pmq-bsd-note-row"><i data-ico="info"></i><span>' +
          (bsd.state === "timeout" ? "BSD timed out — primary turn unaffected." : "BSD unavailable — the primary turn is never blocked.") +
          "</span></div>";
        window.PMIcons.hydrate(el);
        els.push(el);
      }
      (t.bsdEvents || []).forEach(ev => {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-bsd-event";
        el.dataset.surface = "bsd";
        el.innerHTML = '<div class="pmq-bsd-note-row"><i data-ico="sparkle"></i><span>BSD ' + esc(ev.mode === "on" ? "On" : "Auto") + " · " + esc(ev.result) + " — " + esc(ev.note) + "</span></div>";
        window.PMIcons.hydrate(el);
        els.push(el);
      });
      return els;
    }

    const WORKTREE_STATE_LABELS = { isolated: "Isolated", "waiting-writer": "Waiting for writer", conflict: "Conflict", "patch-preserved": "Patch preserved", "cleanup-pending": "Cleanup pending" };
    function opsCards(key) {
      const ops = store.operationalOf(key);
      if (!ops || (!ops.ports.length && !ops.worktrees.length && !ops.sessions.length)) return [];
      const els = [];
      ops.ports.filter(p => p.state === "conflict").forEach(p => {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-port";
        el.dataset.surface = "ops";
        el.innerHTML = '<div class="pmq-port-head"><i data-ico="warn"></i><span class="pmq-surface-title">Port ' + p.port + " is owned by " + esc(p.owner) + "</span></div>" +
          '<div class="pmq-port-detail">Safe alternative is port ' + p.suggestion + "; taking it does not disturb the other worktree.</div>" +
          '<div class="pmq-port-actions"><button class="pmq-btn pmq-btn-primary" type="button" data-portuse="' + p.suggestion + '">Use ' + p.suggestion + "</button>" +
          '<button class="pmq-btn" type="button" data-portcancel>Cancel</button></div>';
        window.PMIcons.hydrate(el);
        el.querySelector("[data-portuse]").addEventListener("click", () => store.portResolve(key, p.port, p.suggestion));
        el.querySelector("[data-portcancel]").addEventListener("click", () => store.portResolve(key, p.port, null));
        els.push(el);
      });
      if (ops.worktrees.length) {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-worktrees";
        el.dataset.surface = "ops";
        el.innerHTML = '<div class="pmq-port-head"><i data-ico="branch"></i><span class="pmq-surface-title">Worktrees</span></div>' +
          ops.worktrees.map(w2 => '<div class="pmq-wt-row"><span class="pmq-wt-name">' + esc(w2.name) + "</span>" +
            '<span class="pmq-wt-state" data-wtst="' + esc(w2.state) + '">' + esc(WORKTREE_STATE_LABELS[w2.state] || w2.state) + "</span>" +
            (w2.owner ? '<span class="pmq-wt-owner">' + esc(w2.owner) + "</span>" : "") + "</div>").join("");
        window.PMIcons.hydrate(el);
        els.push(el);
      }
      if (ops.sessions.length) {
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-opsessions";
        el.dataset.surface = "ops";
        el.innerHTML = '<div class="pmq-port-head"><i data-ico="activity"></i><span class="pmq-surface-title">Testing · debug · backups</span></div>' +
          ops.sessions.map(ss => '<div class="pmq-opsess-row"><span class="pmq-opsess-kind">' + esc(ss.kind) + '</span><span class="pmq-opsess-label">' + esc(ss.label) + '</span><span class="pmq-opsess-state">' + esc(ss.state || "") + "</span></div>").join("");
        window.PMIcons.hydrate(el);
        els.push(el);
      }
      return els;
    }

    const ROUTE_BADGES = { native: "Native", "pm-transformed": "PM transformed", pm: "PM transformed", alternate: "Alternate model", "Alternate model": "Alternate model", unsupported: "Unsupported", "native-or-pm": "Native or PM", "pm-or-alternate": "PM or alternate" };
    function attachmentResolutionCards(key) {
      const s = store.thread(key);
      /* Union of live draft attachments and attachment-route keys, so
         trigger-created routes (attachment.unsupported) render their resolver
         card on ANY thread, not just fixture-seeded draftState ones. */
      const seen = new Set();
      const seeds = [];
      s.draft.attachments.forEach(a => {
        const id = typeof a === "string" ? a : a.id;
        if (!seen.has(id)) { seen.add(id); seeds.push(a); }
      });
      Object.keys(s.attachRoutes).forEach(id => {
        if (!seen.has(id)) { seen.add(id); seeds.push(id); }
      });
      store.messages(key).forEach(m => {
        (m.attachments || []).forEach(a => {
          const id = typeof a === "string" ? a : a.id;
          if (!seen.has(id)) { seen.add(id); seeds.push(a); }
        });
      });
      const els = [];
      seeds.forEach(a => {
        const id = typeof a === "string" ? a : a.id;
        const label = typeof a === "string" ? a : (a.name || a.id);
        const r = s.attachRoutes[id];
        if (!r) return; // ordinary attachment without an explicit route
        const el = document.createElement("div");
        el.className = "pmq-surface pmq-attachres";
        el.dataset.surface = "attachment";
        const badge = ROUTE_BADGES[r.route] || r.route;
        const jobLine = r.job ? (r.job.state === "running" ? '<div class="pmq-ar-job">Transforming…</div>' : '<div class="pmq-ar-job pmq-done">Done · ' + esc(r.job.output || "extracted") + "</div>") : "";
        el.innerHTML = '<div class="pmq-ar-head"><i data-ico="attach"></i><span class="pmq-ar-name">' + esc(label) + '</span><span class="pmq-ar-badge" data-route="' + esc(r.route) + '">' + esc(badge) + "</span></div>" +
          '<div class="pmq-ar-lineage">from ' + esc(r.lineage || id) + "</div>" + jobLine +
          (r.route === "unsupported"
            ? '<div class="pmq-ar-actions"><button class="pmq-btn" type="button" data-aract="cancel">Cancel</button>' +
              '<button class="pmq-btn" type="button" data-aract="extract">Extract in PM</button>' +
              '<button class="pmq-btn pmq-btn-primary" type="button" data-aract="alternate">Use Gemini</button></div>'
            : "");
        window.PMIcons.hydrate(el);
        const cancel = el.querySelector('[data-aract="cancel"]');
        const extract = el.querySelector('[data-aract="extract"]');
        const alt = el.querySelector('[data-aract="alternate"]');
        if (cancel) cancel.addEventListener("click", () => {
          /* Cancel removes the attachment entirely; an unsupported video never
             silently becomes a native route. */
          store.mutate(() => {
            const arr = s.draft.attachments;
            const i = arr.findIndex(x => (typeof x === "string" ? x : x.id) === id);
            if (i >= 0) arr.splice(i, 1);
            delete s.attachRoutes[id];
          });
        });
        if (extract) extract.addEventListener("click", () => { store.attachResolve(id, "pm-transformed"); store.attachStartJob(key, id, "Transcript and frames extracted by PM"); });
        if (alt) alt.addEventListener("click", () => {
          /* Initial selection only opens the consent warning; the alternate-route
             command fires from "Consent once" in warningAction. */
          store.warningInject(key, { tier: "confirm", kind: "attachment", text: "Route the original to an alternate model?", detail: "Consent is required once; PM keeps the lineage from the original attachment.", pendingAttach: id, pendingTarget: "Gemini", choices: ["Cancel", "Consent once"] });
        });
        els.push(el);
      });
      return els;
    }

    function receiptCards(key) {
      const s = store.thread(key);
      const msgs = store.messages(key);
      const els = [];
      const row = (icon, text, cls) => {
        const el = document.createElement("div");
        el.className = "pmq-receipt" + (cls ? " " + cls : "");
        el.innerHTML = '<i data-ico="' + icon + '"></i><span>' + text + "</span>";
        window.PMIcons.hydrate(el);
        return el;
      };
      msgs.filter(m => m.queuedReplay).forEach(m => els.push(row("history", "Replayed from outbox · " + esc((m.body || "").slice(0, 48)), "pmq-rx-outbox")));
      (s.restorePoints || []).forEach(rp => els.push(row("pin", "Restore point created · " + window.PMFmt.ago(rp.at), "pmq-rx-rp")));
      if (s.redirectNote) els.push(row("rewind", "Turn redirected · " + esc(s.redirectNote), "pmq-rx-redirect"));
      (s.warnings || []).forEach(w => {
        if (w.kind === "cross-project" && w.resolved) els.push(row("shield", "Cross-project grant · " + esc(w.resolved), "pmq-rx-grant"));
        if (w.kind === "capacity" && w.forecast && w.resolved) els.push(row("agents", "Capacity forecast resolved · " + esc(w.resolved), "pmq-rx-cap"));
      });
      (store.operationalOf(key).ports || []).forEach(p => {
        if (p.state === "resolved") els.push(row("check", "Port " + p.port + " resolved" + (p.resolvedTo ? " · using " + p.resolvedTo : ""), "pmq-rx-port"));
      });
      return els;
    }

    /* Durable v3 receipts always render, whatever the work composition shows.
       Same dedupe-guard pattern as appendRecords. */
    function appendReceipts(container, key) {
      if (container.querySelector(".pmq-v3receipts")) return;
      const recs = receiptCards(key);
      if (!recs.length) return;
      const wrap = document.createElement("div");
      wrap.className = "pmq-surfaces pmq-v3receipts";
      recs.forEach(el => wrap.appendChild(el));
      container.appendChild(wrap);
    }

    function activityLiveCard(key) {
      const live = store.activityLive(key);
      if (!live) return null;
      const s = store.thread(key);
      const open = s.expandedActivity.includes("live");
      const icoFor = { thought: "sparkle", exploration: "search", read: "file", fetch: "globe", browser: "globe", test: "flask", edit: "edit", generate: "wand", completion: "check", search: "search", web: "globe", verify: "check" };
      const el = document.createElement("div");
      el.className = "pmq-agroup pmq-agroup-live" + (open ? " pmq-open" : "");
      el.dataset.ag = "live";
      const phases = live.stages.map(st2 => '<span class="pmq-ag-phase' + (st2.status === "complete" ? " pmq-done" : "") + '" title="' + esc(st2.label) + '"><i data-ico="' + (icoFor[st2.kind] || "activity") + '"></i></span>').join("");
      const stages = live.stages.map(st2 => {
        const extra = st2.added != null ? '<span class="pmq-ag-add">+' + st2.added + '</span><span class="pmq-ag-del">−' + (st2.removed || 0) + "</span>" : (st2.count != null ? '<span class="pmq-ag-count">' + st2.count + "</span>" : "");
        const items = st2.items && st2.items.length ? '<div class="pmq-ag-items">' + st2.items.map(i2 => '<span class="pmq-ag-item"><i data-ico="file"></i>' + esc(i2) + "</span>").join("") + "</div>" : "";
        return '<div class="pmq-ag-stage pmq-tl-node"><span class="pmq-ag-stage-head"><i data-ico="' + (icoFor[st2.kind] || "activity") + '"></i><span class="pmq-ag-label">' + esc(st2.label) + "</span>" + extra + "</span>" + items + "</div>";
      }).join("");
      el.innerHTML = '<button class="pmq-ag-head" type="button" data-agtoggle aria-expanded="' + open + '">' +
        '<span class="pmq-ag-phases">' + phases + "</span>" +
        '<i data-ico="activity"></i><span class="pmq-ag-compact" data-agcompact>' + esc(live.compactLabel || "Working") + "</span>" +
        (live.status === "running" ? orbitHtml("pmq-ag-live-orbit") : '<span class="pmq-ag-worked">Worked for ' + fmt.dur(live.workedSeconds || 0) + "</span>") +
        '<i data-ico="' + (open ? "collapse" : "expand") + '" class="pmq-ag-chev"></i></button>' +
        gridWrap(open, '<div class="pmq-ag-stages pmq-timeline">' + stages + "</div>", null, "ag-live");
      window.PMIcons.hydrate(el);
      el.querySelector("[data-agtoggle]").addEventListener("click", () => toggleSurface("ag-live", () => store.mutate(() => {
        const i = s.expandedActivity.indexOf("live");
        if (i >= 0) s.expandedActivity.splice(i, 1); else s.expandedActivity.push("live");
      })));
      /* Gradual condense beat (video 03): when the run finishes, the live card
         settles into its compact strip before the completed group replaces it. */
      if (live.status !== "running" && window.PMAnim && !A.reduced()) {
        try {
          el.animate([{ opacity: 1, transform: "none" }, { opacity: 0.35, transform: "scale(0.985)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
          const head = el.querySelector(".pmq-ag-head");
          if (head) head.animate([{ boxShadow: "0 0 0 0 transparent" }, { boxShadow: "0 0 0 2px color-mix(in srgb, var(--accent-primary) 25%, transparent)" }, { boxShadow: "0 0 0 0 transparent" }], { duration: 480, easing: "ease-out" });
        } catch (e) {}
      }
      return el;
    }

    function threadRequestCards(key) {
      const s = store.thread(key);
      const reqs = (s.threadRequests || []).filter(r => r.status !== "spawned" || true);
      if (!reqs.length) return [];
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-requests";
      el.dataset.surface = "requests";
      el.innerHTML = '<div class="pmq-surface-head pmq-surface-head-static"><i data-ico="chats"></i><span class="pmq-surface-title">Thread requests</span>' +
        '<span class="pmq-sg-counts">' + reqs.length + "</span></div>" +
        '<div class="pmq-req-body">' + reqs.map(r => {
          const target = store.demoThread(r.target);
          return '<div class="pmq-req-row" data-status="' + esc(r.status) + '">' +
            '<i data-ico="' + (r.status === "spawned" ? "plus" : "send") + '"></i>' +
            '<span class="pmq-req-main"><b>' + esc(r.status === "spawned" ? "Spawned " + (target ? target.title : r.target) : "Request to " + (target ? target.title : r.target)) + "</b>" +
            '<span class="pmq-req-text">' + esc(r.text) + "</span>" +
            (r.response ? '<span class="pmq-req-res">Reply · ' + esc(r.response) + "</span>" : "") +
            (r.status === "sent" ? '<span class="pmq-req-wait">Waiting for response…</span>' : "") + "</span>" +
            '<button class="pmq-btn" type="button" data-reqopen="' + esc(r.target) + '">Open</button>' +
            (r.status === "sent" ? '<button class="pmq-btn" type="button" data-reqrecv="' + esc(r.id) + '">Simulate reply</button>' : "") +
            "</div>";
        }).join("") + "</div>";
      window.PMIcons.hydrate(el);
      el.querySelectorAll("[data-reqopen]").forEach(b => b.addEventListener("click", () => store.switchThread(b.dataset.reqopen)));
      el.querySelectorAll("[data-reqrecv]").forEach(b => b.addEventListener("click", () => store.threadRequestReceive(key, b.dataset.reqrecv, "Findings attached in the child thread; the relevant range is quoted above the fold.")));
      return [el];
    }

    function compactReceipts(key) {
      const s = store.thread(key);
      if (!s.compactEvents.length) return [];
      const el = document.createElement("div");
      el.className = "pmq-surface pmq-compactev";
      el.dataset.surface = "compact";
      el.innerHTML = '<div class="pmq-surface-head pmq-surface-head-static"><i data-ico="compact"></i><span class="pmq-surface-title">Context compacted</span>' +
        '<span class="pmq-sg-counts">' + s.compactEvents.length + "</span></div>" +
        '<div class="pmq-req-body">' + s.compactEvents.map(c3 => '<div class="pmq-req-row"><i data-ico="compact"></i><span class="pmq-req-main"><b>' + esc(fmt.ago(c3.at)) + "</b><span class=\"pmq-req-text\">" + esc(c3.summary) + "</span></span></div>").join("") + "</div>";
      window.PMIcons.hydrate(el);
      return [el];
    }

    function workData(key) {
      const s = store.thread(key);
      const td = store.todoList(key);
      const groups = store.subagentGroups(key);
      const diffs = store.diffGroups(key);
      let agents = 0, queued = 0, blocked = 0;
      groups.forEach(g => g.agents.forEach(a => {
        agents++;
        if (a.status === "queued") queued++;
        if (a.status === "blocked") blocked++;
      }));
      let adds = 0, dels = 0, files = 0;
      diffs.forEach(g => g.files.forEach(f => { adds += f.added || 0; dels += f.removed || 0; files++; }));
      const ops = store.operationalOf(key);
      const t = store.demoThread(key) || {};
      const attachCount = ((t.draftState && t.draftState.attachments) || []).filter(a => s.attachRoutes[typeof a === "string" ? a : a.id]).length;
      const bsd = store.bsdEffective(key);
      return {
        goalStatus: store.goalEffectiveStatus(key),
        goalPhase: store.goalPhases(key) ? store.goalPhases(key)[Math.min(store.goalPhaseIdx(key), (store.goalPhases(key) || []).length - 1)] : null,
        goalPhases: store.goalPhases(key),
        goalPhaseIdx: store.goalPhaseIdx(key),
        todoDone: td ? td.items.filter(i => i.state === "complete").length : 0,
        todoTotal: td ? td.items.length : 0,
        agents, queued, blocked,
        diffAdds: adds, diffDels: dels, diffFiles: files,
        live: store.activityLive(key),
        approvals: (s.approvals || []).filter(a => !a.resolved).length,
        warnings: (s.warnings || []).filter(w => !w.resolved && w.kind !== "cross-project" && !(w.kind === "capacity" && w.forecast)).length,
        grant: !!(s.warnings || []).find(w => w.kind === "cross-project" && !w.resolved),
        capacity: (s.warnings || []).filter(w => w.kind === "capacity" && w.forecast && !w.resolved).length,
        ops: ops.ports.filter(p => p.state === "conflict").length + ops.worktrees.length + ops.sessions.length,
        ports: ops.ports.filter(p => p.state === "conflict").length,
        bsd: (s.bsdAdvice ? 1 : 0) + (bsd.state === "timeout" || bsd.state === "unavailable" ? 1 : 0) + (t.bsdEvents || []).length,
        attach: attachCount
      };
    }

    function surfaceList(key) {
      const els = [];
      const goal = goalCard(key);
      if (goal) els.push(goal);
      const todo = todoCard(key);
      if (todo) els.push(todo);
      els.push(...subagentCards(key));
      els.push(...approvalCards(key));
      const grant = grantCard(key);
      if (grant) els.push(grant);
      els.push(...capacityCards(key));
      els.push(...warningCards(key));
      els.push(...bsdCards(key));
      els.push(...opsCards(key));
      els.push(...attachmentResolutionCards(key));
      const liveCard = activityLiveCard(key);
      if (liveCard) els.push(liveCard);
      els.push(...diffCards(key));
      const crew = crewCard(key);
      if (crew) els.push(crew);
      els.push(...artifactCards(key));
      els.push(...threadRequestCards(key));
      els.push(...compactReceipts(key));
      els.push(...questRecordCards(key));
      els.push(...receiptCards(key));
      return els;
    }

    function workApi(key) {
      return {
        env, store, A, esc, fmt, gridWrap, toggleSurface, expandSurface, collapseSurface,
        data: workData(key),
        builders: { goalCard, todoCard, subagentCards, diffCards, artifactCards, activityLiveCard, approvalCards, warningCards, crewCard, questRecordCards, grantCard, capacityCards, bsdCards, opsCards, attachmentResolutionCards, receiptCards, stateGlyph, orbitHtml, checkSvg },
        surfaceList: surfaceList(key),
        justOpened, numChanged
      };
    }

    /* Durable receipts (questionnaire records, compact-now events) always
       render, whatever the concept's work composition chooses to show. */
    function appendRecords(container, key) {
      if (container.querySelector(".pmq-questrecord, .pmq-compactev")) return;
      const recs = questRecordCards(key).concat(compactReceipts(key));
      if (!recs.length) return;
      const wrap = document.createElement("div");
      wrap.className = "pmq-surfaces pmq-surfaces-records";
      recs.forEach(el => wrap.appendChild(el));
      container.appendChild(wrap);
    }

    function appendSurfaces(container, key) {
      if (typeof opts.workRender === "function") {
        try { opts.workRender(container, key, workApi(key)); } catch (e) { console.error(e); }
        appendRecords(container, key);
        appendReceipts(container, key);
        return;
      }
      const wrap = document.createElement("div");
      wrap.className = "pmq-surfaces" + (opts.surfacesStyle === "chips" ? " pmq-surfaces-chips" : "");
      surfaceList(key).forEach(el => wrap.appendChild(el));
      if (wrap.children.length) container.appendChild(wrap);
    }

    function renderBand(key) {
      if (!bandEl) return;
      bandEl.innerHTML = "";
      if (typeof opts.workRender === "function") {
        try { opts.workRender(bandEl, key, workApi(key)); } catch (e) { console.error(e); }
        appendRecords(bandEl, key);
        appendReceipts(bandEl, key);
      } else {
        surfaceList(key).forEach(el => bandEl.appendChild(el));
      }
      window.PMIcons.hydrate(bandEl);
      bandEl.classList.toggle("pmq-empty-band", !bandEl.children.length);
    }

    /* STATEFUL QUESTIONNAIRE (§C). Created ONCE per mount; fullRender calls
       quest.sync() instead of rebuilding questZone. Owns its DOM and animates
       transitions itself. All handoff logic invariants are preserved. */
    const quest = {
      mounted: false,
      questId: null,
      lastIdx: -1,
      submitting: false,
      shell: null,

      isAnswered(q, x) {
        const a = store.questAnswer(q, x);
        if (x.kind === "freeform") return !!(a.draft && a.draft.trim());
        return !!(a.selected && a.selected.length);
      },

      capsuleClasses(q, x, i, idx) {
        return "pmq-qcap" + (i === idx ? " pmq-here" : "") + (this.isAnswered(q, x) ? " pmq-answered" : "");
      },

      slideHtml(q, question) {
        const ans = store.questAnswer(q, question);
        let body = "";
        if (question.kind === "freeform") {
          body = '<textarea class="pmq-quest-free" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + esc(ans.draft || "") + "</textarea>";
        } else {
          const multi = question.kind === "multi select";
          body = '<div class="pmq-quest-opts">' + question.options.map(o => {
            const on = (ans.selected || []).includes(o);
            return '<button class="pmq-quest-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + esc(o) + '" aria-pressed="' + on + '">' +
              '<span class="pmq-quest-mark">' + (multi ? '<i data-ico="check"></i>' : "") + "</span><span>" + esc(o) + "</span></button>";
          }).join("") + "</div>";
        }
        return '<div class="pmq-quest-prompt">' + esc(question.prompt) + (question.required ? "" : ' <span class="pmq-quest-optional">Optional</span>') + "</div>" + body;
      },

      buildShell(q, key) {
        const idx = store.questIndex(q, key);
        const el = document.createElement("div");
        el.className = "pmq-quest pmq-open";
        el.innerHTML =
          '<div class="pmq-quest-shell">' +
            '<div class="pmq-quest-card">' +
              '<div class="pmq-quest-head">' +
                '<span class="pmq-quest-title"><i data-ico="question"></i>Question <span class="pmq-quest-num" data-qnum>' + (idx + 1) + " of " + q.questions.length + "</span></span>" +
                '<span class="pmq-qcaps" data-qcaps>' + q.questions.map((x, i) => '<span class="' + this.capsuleClasses(q, x, i, idx) + '"></span>').join("") + "</span>" +
                '<button class="pmq-btn pmq-btn-icon" type="button" data-qcancel aria-label="Cancel questionnaire"><i data-ico="close"></i></button>' +
              "</div>" +
              '<div class="pmq-quest-viewport"><div class="pmq-quest-slide" data-qslide>' + this.slideHtml(q, q.questions[idx]) + "</div></div>" +
              '<div class="pmq-quest-foot">' +
                '<button class="pmq-btn" type="button" data-qprev><i data-ico="chevRight" style="transform:scaleX(-1)"></i>Previous</button>' +
                '<button class="pmq-btn pmq-quest-act" type="button" data-qact>' +
                  '<span class="pmq-act-skip">Skip this question</span>' +
                  '<span class="pmq-act-submit">Submit questionnaire</span>' +
                "</button>" +
                '<span class="pmq-quest-spacer"></span>' +
                '<button class="pmq-btn pmq-btn-primary" type="button" data-qnext>Next<i data-ico="chevRight"></i></button>' +
              "</div>" +
            "</div>" +
            '<div class="pmq-quest-pillform" hidden>' + orbitHtml("pmq-quest-orbit") + '<span class="pmq-pill-text" data-pilltext>Preparing…</span></div>' +
          "</div>";
        window.PMIcons.hydrate(el);
        el.addEventListener("click", e => this.onClick(e, q, key));
        el.addEventListener("input", e => {
          if (e.target.matches("[data-free]")) {
            const question = q.questions[store.questIndex(q, key)];
            store.questSetAnswer(q, question, e.target.value);
          }
        });
        questZone.appendChild(el);
        this.shell = el;
        this.mounted = true;
        this.updateChrome(q, idx);
        this.wireFree(q, key);
        // pill -> card entrance morph (bottom-anchored), then staged inner reveal
        const shellNode = el.querySelector(".pmq-quest-shell");
        A.morphClip(shellNode, "86% 0 0 0 round 999px", "0 0 0 0 round var(--radius-lg)", {
          duration: 420,
          onDone: () => {
            A.staggerIn([el.querySelector(".pmq-quest-title"), el.querySelector(".pmq-quest-viewport"), el.querySelector(".pmq-qcaps"), el.querySelector(".pmq-quest-foot")], { rise: 8, step: 35, cap: 280 });
          }
        });
      },

      wireFree(q, key) {
        // input handled via delegated listener; nothing extra needed
      },

      onClick(e, q, key) {
        const opt = e.target.closest("[data-opt]");
        if (opt) {
          const idx = store.questIndex(q, key);
          const question = q.questions[idx];
          const ans = store.questAnswer(q, question);
          const val = opt.dataset.opt;
          A.pop(opt.querySelector(".pmq-quest-mark"));
          if (question.kind === "multi select") {
            const cur = (ans.selected || []).slice();
            const i = cur.indexOf(val);
            if (i >= 0) cur.splice(i, 1); else cur.push(val);
            store.questSetAnswer(q, question, cur);
          } else {
            store.questSetAnswer(q, question, [val]);
          }
          return;
        }
        if (e.target.closest("[data-qcancel]")) { store.questCancel(q); return; }
        const act = e.target.closest("[data-qact]");
        if (act) {
          const idx = store.questIndex(q, key);
          if (idx >= q.questions.length - 1) {
            if (store.questValid(q)) this.doSubmit(q);
          } else {
            store.questSkip(q);
          }
          return;
        }
        if (e.target.closest("[data-qprev]")) { store.questGoTo(q, store.questIndex(q, key) - 1); return; }
        if (e.target.closest("[data-qnext]")) { store.questGoTo(q, store.questIndex(q, key) + 1); return; }
      },

      doSubmit(q) {
        this.submitting = true;
        const el = this.shell;
        if (!el) {
          /* Custom-renderer path: show the shared submitting pill in the quest
             zone, then resolve (video 04). */
          questZone.innerHTML = "";
          const pe = document.createElement("div");
          pe.className = "pmq-quest pmq-pill";
          pe.innerHTML = '<div class="pmq-quest-shell"><div class="pmq-quest-pillform">' + orbitHtml("pmq-quest-orbit") + '<span class="pmq-pill-text">Submitting answers…</span></div></div>';
          window.PMIcons.hydrate(pe);
          questZone.appendChild(pe);
          const done = () => { this.submitting = false; store.questSubmit(q); env.hostApi.toast("Questionnaire submitted"); };
          if (window.PMAnim && !A.reduced()) setTimeout(done, 420); else done();
          return;
        }
        const card = el.querySelector(".pmq-quest-card");
        const pill = el.querySelector(".pmq-quest-pillform");
        const pillText = el.querySelector("[data-pilltext]");
        if (pillText) pillText.textContent = "Submitting answers…";
        el.classList.remove("pmq-open");
        el.classList.add("pmq-pill");
        if (card) card.style.opacity = "0";
        if (pill) pill.hidden = false;
        const shellNode = el.querySelector(".pmq-quest-shell");
        A.morphClip(shellNode, "0 0 0 0 round var(--radius-lg)", "86% 0 0 0 round 999px", {
          duration: 380,
          onDone: () => {
            this.submitting = false;
            store.questSubmit(q);
            env.hostApi.toast("Questionnaire submitted");
          }
        });
      },

      reviewMode: false,

      /* Visible "Preparing questions…" pill (video 04) shown before the card
         morphs in; custom renderers call api.preparePill() at mount. */
      preparePill(q) {
        questZone.innerHTML = "";
        const el = document.createElement("div");
        el.className = "pmq-quest pmq-pill";
        el.innerHTML = '<div class="pmq-quest-shell"><div class="pmq-quest-pillform">' + orbitHtml("pmq-quest-orbit") + '<span class="pmq-pill-text">Preparing questions…</span></div></div>';
        window.PMIcons.hydrate(el);
        questZone.appendChild(el);
        return el;
      },

      submittingPill(q) {
        const el = this.shell;
        const pill = el && el.querySelector(".pmq-quest-pillform");
        const txt = el && el.querySelector("[data-pilltext]");
        if (txt) txt.textContent = "Submitting answers…";
        if (el) {
          el.classList.remove("pmq-open"); el.classList.add("pmq-pill");
          const card = el.querySelector(".pmq-quest-card"); if (card) card.style.opacity = "0";
          if (pill) pill.hidden = false;
        }
        return el;
      },

      /* Pre-submit review page (video 02): every answer listed with per-question
         Back links; Submit lives here. */
      reviewHtml(q) {
        this.reviewMode = true;
        const rows = q.questions.map((x, i) => {
          const a = store.questAnswer(q, x);
          const val = x.kind === "freeform" ? (a.draft || "") : (a.selected || []).join(", ");
          const skipped = !this.isAnswered(q, x);
          return '<div class="pmq-quest-revrow"><button class="pmq-quest-revback" type="button" data-revto="' + i + '">Q' + (i + 1) + "</button>" +
            '<div class="pmq-quest-revbody"><div class="pmq-quest-revprompt">' + esc(x.prompt) + "</div>" +
            '<div class="pmq-quest-revans' + (skipped ? " pmq-skipped" : "") + '">' + (skipped ? "Skipped" : esc(val)) + "</div></div></div>";
        }).join("");
        return '<div class="pmq-quest-review"><div class="pmq-quest-revhead">Review your answers</div>' + rows + "</div>";
      },

      updateChrome(q, idx) {
        const el = this.shell;
        if (!el) return;
        const last = idx >= q.questions.length - 1;
        const valid = store.questValid(q);
        // capsules
        const caps = el.querySelectorAll("[data-qcaps] .pmq-qcap");
        q.questions.forEach((x, i) => {
          const c = caps[i];
          if (!c) return;
          const wasHere = c.classList.contains("pmq-here");
          c.className = this.capsuleClasses(q, x, i, idx);
          if (i === idx && !wasHere) A.pop(c);
        });
        // numeral crossfade
        const numCell = el.querySelector("[data-qnum]");
        const numText = (idx + 1) + " of " + q.questions.length;
        if (numCell && numCell.textContent !== numText) A.crossfadeNum(numCell, numText);
        // action mode (Skip <-> Submit)
        const act = el.querySelector("[data-qact]");
        if (act) {
          act.classList.toggle("pmq-act-mode-submit", last);
          act.disabled = last && !valid;
        }
        // prev / next availability
        const prev = el.querySelector("[data-qprev]");
        const next = el.querySelector("[data-qnext]");
        if (prev) prev.disabled = idx === 0;
        if (next) next.hidden = last;
      },

      renderSlide(q, idx) {
        const el = this.shell;
        const slide = el.querySelector("[data-qslide]");
        if (!slide) return;
        slide.innerHTML = this.slideHtml(q, q.questions[idx]);
        window.PMIcons.hydrate(slide);
      },

      refreshOptions(q, idx) {
        const el = this.shell;
        const question = q.questions[idx];
        if (question.kind === "freeform") return;
        const ans = store.questAnswer(q, question);
        el.querySelectorAll(".pmq-quest-opt").forEach(opt => {
          const on = (ans.selected || []).includes(opt.dataset.opt);
          opt.classList.toggle("pmq-on", on);
          opt.setAttribute("aria-pressed", on);
        });
      },

      advance(q, fromIdx, toIdx) {
        const el = this.shell;
        const viewport = el.querySelector(".pmq-quest-viewport");
        const dir = toIdx > fromIdx ? 1 : -1;
        const buildSlide = () => {
          const s = document.createElement("div");
          s.className = "pmq-quest-slide";
          s.innerHTML = this.slideHtml(q, q.questions[toIdx]);
          window.PMIcons.hydrate(s);
          return s;
        };
        if (!viewport || A.reduced() || !window.PMAnim) {
          this.renderSlide(q, toIdx);
          this.updateChrome(q, toIdx);
          return;
        }
        const old = viewport.querySelector(".pmq-quest-slide");
        const incoming = buildSlide();
        /* Both slides share one grid cell (top-anchored), so the incoming node
           is measurable before the old one leaves: tween the viewport to the
           incoming slide's own height so a short slide never inherits the void
           of the tallest one ever shown. */
        const hOld = old ? old.offsetHeight : 0;
        viewport.appendChild(incoming);
        const hNew = incoming.offsetHeight;
        const rise = 26 * dir;
        try {
          if (hOld && Math.abs(hOld - hNew) > 1) {
            viewport.animate([{ height: hOld + "px" }, { height: hNew + "px" }], { duration: 260, easing: "cubic-bezier(0.22,1,0.36,1)" });
          }
          if (old) old.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(" + (-rise) + "px)" }], { duration: 200, easing: "ease-in" }).finished.then(() => { if (old.parentNode) old.parentNode.removeChild(old); }).catch(() => { if (old.parentNode) old.parentNode.removeChild(old); });
          incoming.animate([{ opacity: 0, transform: "translateY(" + rise + "px)" }, { opacity: 1, transform: "none" }], { duration: 280, easing: "cubic-bezier(0.22,1.15,0.36,1)" });
        } catch (e) {
          if (old && old.parentNode) old.parentNode.removeChild(old);
        }
        this.updateChrome(q, toIdx);
      },

      api(q, key) {
        const self = this;
        return {
          env, store, A, esc, fmt, gridWrap,
          q, key,
          index: () => store.questIndex(q, key),
          answer: x => store.questAnswer(q, x),
          isAnswered: x => self.isAnswered(q, x),
          valid: () => store.questValid(q),
          select: (x, val) => {
            const ans = store.questAnswer(q, x);
            if (x.kind === "multi select") {
              const cur = (ans.selected || []).slice();
              const i = cur.indexOf(val);
              if (i >= 0) cur.splice(i, 1); else cur.push(val);
              store.questSetAnswer(q, x, cur);
            } else {
              store.questSetAnswer(q, x, [val]);
            }
          },
          setFree: (x, v) => store.questSetAnswer(q, x, v),
          next: () => store.questGoTo(q, store.questIndex(q, key) + 1),
          prev: () => store.questGoTo(q, store.questIndex(q, key) - 1),
          skip: () => store.questSkip(q),
          cancel: () => store.questCancel(q),
          submit: () => self.doSubmit(q),
          reduced: () => A.reduced(),
          /* Causal lifecycle hooks (video 04): concepts express
             prepare -> card -> review -> submitting -> receipt in their own
             idiom using the shared morph primitive. */
          preparePill: () => self.preparePill(q),
          submittingPill: () => self.submittingPill(q),
          reviewHtml: () => self.reviewHtml(q),
          reviewMode: () => self.reviewMode,
          gotoQuestion: i => store.questGoTo(q, i)
        };
      },

      sync() {
        const key = activeKey();
        const q = store.activeQuestionnaire(key);
        composerEl.hidden = !!(q || this.submitting);
        if (typeof opts.questRenderer === "function") {
          if (!q) {
            if (this.custom) { try { this.custom.unmount && this.custom.unmount(); } catch (e) {} this.custom = null; }
            this.mounted = false; this.questId = null; this.lastIdx = -1;
            return;
          }
          if (!this.custom || this.questId !== q.id) {
            if (this.custom && this.custom.unmount) { try { this.custom.unmount(); } catch (e) {} }
            questZone.innerHTML = "";
            this.custom = opts.questRenderer(questZone, this.api(q, key));
            this.questId = q.id;
            this.mounted = true;
            this.lastIdx = store.questIndex(q, key);
            return;
          }
          if (this.custom && this.custom.update) this.custom.update(q, store.questIndex(q, key));
          return;
        }
        if (!q) {
          if (this.submitting) return;
          if (this.mounted) this.clear();
          return;
        }
        if (!this.mounted || this.questId !== q.id) {
          this.clear();
          this.buildShell(q, key);
          this.questId = q.id;
          this.lastIdx = store.questIndex(q, key);
          return;
        }
        const idx = store.questIndex(q, key);
        if (idx !== this.lastIdx) {
          this.advance(q, this.lastIdx, idx);
          this.lastIdx = idx;
        } else {
          this.refreshOptions(q, idx);
          this.updateChrome(q, idx);
        }
      },

      clear() {
        if (this.shell && this.shell.parentNode) this.shell.parentNode.removeChild(this.shell);
        this.shell = null;
        this.mounted = false;
        this.questId = null;
        this.lastIdx = -1;
      }
    };

    function buildComposer(container) {
      container.innerHTML =
        '<div class="pmq-attachrow" hidden></div>' +
        '<div class="pmq-composer">' +
        '<div class="pmq-composer-main">' +
        '<button class="pmq-btn pmq-btn-icon" type="button" data-attach aria-label="Attach"><i data-ico="attach"></i></button>' +
        '<textarea class="pmq-composer-input" rows="1" spellcheck="true" autocorrect="off" autocapitalize="off" placeholder="Message Puppet Master" aria-label="Message"></textarea>' +
        '<button class="pmq-btn pmq-btn-icon" type="button" data-drafts aria-label="Draft history"><i data-ico="history"></i></button>' +
        '<button class="pmq-sendstop" type="button" data-sendstop aria-label="Send"><i data-ico="send"></i></button>' +
        "</div>" +
        '<div class="pmq-composer-hint"><span class="pmq-hint-draft" hidden>Draft saved · crash-safe</span>' +
        '<span class="pmq-hint-spell" hidden></span><span class="pmq-hint-offline" hidden>Offline · sends queue and replay once on reconnect</span></div>' +
        "</div>";
      window.PMIcons.hydrate(container);
      const ta = container.querySelector("textarea");
      const sendBtn = container.querySelector("[data-sendstop]");
      const attachRow = container.querySelector(".pmq-attachrow");
      const draftHint = container.querySelector(".pmq-hint-draft");
      const spellHint = container.querySelector(".pmq-hint-spell");
      if (window.PMChatSpell) window.PMChatSpell.attach(ta, env, spellHint);
      let revTimer = null;

      function autosize() {
        ta.style.height = "auto";
        ta.style.height = Math.min(160, ta.scrollHeight) + "px";
      }

      function syncFromStore() {
        const s = st();
        if (document.activeElement !== ta && ta.value !== s.draft.text) {
          ta.value = s.draft.text;
          autosize();
        }
        renderAttachRow(s);
        updateSendStop();
      }

      function attachKind(name) {
        const ext = (name.split(".").pop() || "").toLowerCase();
        if (["mov", "mp4", "webm"].includes(ext)) return "video";
        if (["mp3", "wav", "m4a"].includes(ext)) return "audio";
        if (ext === "zip") return "zip";
        if (ext === "pdf") return "pdf";
        if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
        return "file";
      }

      function attachRouteLabel(key, name) {
        const route = store.attachRouteFor(key, { id: name, kind: attachKind(name) });
        if (route === "native") return "Native";
        if (route === "pm") return "PM transformed";
        if (route === "pm-or-alternate") return "PM or alternate";
        if (route === "unsupported") return "Unsupported";
        return "Native or PM";
      }

      function renderAttachRow(s) {
        if (!s.draft.attachments.length) { attachRow.hidden = true; attachRow.innerHTML = ""; return; }
        attachRow.hidden = false;
        const key = activeKey();
        attachRow.innerHTML = s.draft.attachments.map((a, i) => {
          const norm = typeof a === "string" ? { id: a, label: a, kind: attachKind(a) } : { id: a.id, label: a.name || a.id, kind: a.kind || attachKind(a.name || a.id) };
          const forced = s.attachRoutes[norm.id];
          return '<span class="pmq-attach-chip" data-attachid="' + esc(norm.id) + '"><i data-ico="file"></i>' + esc(norm.label) +
            '<button class="pmq-attach-route" type="button" data-route="' + i + '" title="Attachment route">' + esc(forced ? forced.route : attachRouteLabel(key, norm.id)) + "</button>" +
            (forced && forced.reeval ? '<span class="pmq-attach-reeval" title="Model changed · route re-evaluated">re-check</span>' : "") +
            '<button type="button" data-unattach="' + i + '" aria-label="Remove attachment"><i data-ico="close"></i></button></span>';
        }).join("");
        window.PMIcons.hydrate(attachRow);
      }

      function attachRoutePopup(anchor, key, name) {
        const kind = attachKind(name);
        const s = store.effectiveSettings(key);
        const cm = store.catalogModel(s.model);
        const caps = cm ? cm.model.caps : {};
        const nativeOk = kind === "image" || kind === "file" || kind === "zip" || kind === "pdf" || !!caps[kind];
        const altModel = (() => {
          for (const p of store.catalog()) for (const m2 of p.models) if (m2.caps && m2.caps[kind] && m2.name !== s.model) return m2.name + " · " + p.provider;
          return null;
        })();
        const items = [];
        if (nativeOk) items.push({ label: "Native · " + s.model + " inspects the original", icon: "check", onpick: () => store.attachSetRoute(key, name, "Native", true) });
        items.push({ label: "PM transformed · transcript/frames/tiles", icon: "compact", sub: "Stays on the current route", onpick: () => store.attachSetRoute(key, name, "PM transformed", true) });
        if (altModel) items.push({ label: "Alternate model · " + altModel, icon: "sparkle", sub: "Privacy and cost consequence · consent required", onpick: () => {
            store.warningInject(key, {
              tier: "modal", kind: "attachment", text: "Routing “" + name + "” to " + altModel + " sends this file to another provider.",
              detail: "The alternate route uses a separate paid connection. Consent is required unless a scoped policy already permits it.",
              choices: ["Consent once", "Cancel"], pendingAttach: name, pendingRoute: "Alternate model"
            });
          } });
        if (kind === "video" && !nativeOk && !altModel) items.push({ label: "No safe route exists", icon: "warn", disabled: true });
        env.popups.menu(anchor, items, { title: "Attachment route", width: 300 });
      }

      attachRow.addEventListener("click", e => {
        const b = e.target.closest("[data-unattach]");
        if (b) {
          const s = st();
          store.mutate(() => { s.draft.attachments.splice(+b.dataset.unattach, 1); });
          return;
        }
        const r = e.target.closest("[data-route]");
        if (r) {
          const s = st();
          attachRoutePopup(r, activeKey(), s.draft.attachments[+r.dataset.route]);
        }
      });

      function updateSendStop() {
        const s = st();
        const running = store.isRunning(activeKey());
        const hasText = ta.value.trim().length > 0;
        const showStop = running && !hasText;
        const conn = store.state.connection.status;
        const offline = conn === "offline" || conn === "cached";
        const eff = store.effectiveSettings(activeKey());
        const grp = store.catalog().find(p => p.provider === eff.provider);
        const setupBlocked = !!(grp && grp.setupState === "install-required");
        sendBtn.classList.toggle("pmq-is-stop", showStop);
        sendBtn.classList.toggle("pmq-is-queue", offline && hasText);
        sendBtn.disabled = setupBlocked;
        if (setupBlocked) {
          sendBtn.setAttribute("title", "Send disabled · Install required — open Provider Settings");
          sendBtn.setAttribute("aria-label", "Send disabled · install required");
          sendBtn.innerHTML = '<i data-ico="warn"></i>';
        } else {
          sendBtn.removeAttribute("title");
          sendBtn.setAttribute("aria-label", showStop ? "Stop" : offline ? "Queue message" : "Send");
          sendBtn.innerHTML = '<i data-ico="' + (showStop ? "stop" : "send") + '"></i>';
        }
        const offHint = container.querySelector(".pmq-hint-offline");
        if (offHint) offHint.hidden = !offline;
        window.PMIcons.hydrate(sendBtn);
      }

      ta.addEventListener("input", () => {
        store.setDraft(ta.value);
        autosize();
        updateSendStop();
        clearTimeout(revTimer);
        if (ta.value.trim()) {
          if (draftHint.hidden) { draftHint.hidden = false; A.pop(draftHint); }
          revTimer = setTimeout(() => store.pushRevision(), 1400);
        } else draftHint.hidden = true;
      });

      ta.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); }
      });

      function doSend() {
        const running = store.isRunning(activeKey());
        const hasText = ta.value.trim().length > 0;
        if (running && !hasText) { store.stopRun(); return; }
        if (!hasText && !st().draft.attachments.length) return;
        if (running && hasText) {
          const text = ta.value;
          env.popups.menu(sendBtn, [
            { label: "Redirect the active turn", icon: "rewind", sub: "Steer the current run toward this message", onpick: () => {
                store.redirectTurn(activeKey(), text);
                ta.value = ""; autosize(); draftHint.hidden = true; updateSendStop();
              } },
            { label: "Send as a new message", icon: "send", sub: "Queues after the active turn", onpick: () => {
                A.pop(sendBtn); store.send(text); ta.value = ""; autosize(); draftHint.hidden = true; scrollBottom(true);
              } }
          ], { title: "A turn is still active", width: 270 });
          return;
        }
        A.pop(sendBtn);
        store.send(ta.value);
        ta.value = "";
        autosize();
        draftHint.hidden = true;
        scrollBottom(true);
      }

      sendBtn.addEventListener("click", doSend);

      container.querySelector("[data-attach]").addEventListener("click", e => {
        env.popups.menu(e.currentTarget, [
          { label: "screenshots/draft-recovery-one.png", icon: "file", onpick: () => addAttach("screenshots/draft-recovery-one.png") },
          { label: "screenshots/draft-recovery-two.png", icon: "file", onpick: () => addAttach("screenshots/draft-recovery-two.png") },
          { label: "recordings/provider-flow.mov", icon: "play", sub: "Selected model lacks video · PM can extract", onpick: () => addAttach("recordings/provider-flow.mov") },
          { label: "exports/provider-matrix.zip", icon: "folder", sub: "PM inspects and extracts", onpick: () => addAttach("exports/provider-matrix.zip") },
          { label: "Browser Program capture · current page", icon: "globe", onpick: () => addAttach("browser-capture-current-page.png") }
        ], { title: "Attach", width: 300 });
      });

      function addAttach(name) {
        const s = st();
        store.mutate(() => { if (!s.draft.attachments.includes(name)) s.draft.attachments.push(name); });
      }

      container.querySelector("[data-drafts]").addEventListener("click", e => {
        const s = st();
        const revs = s.draft.revisions.slice().reverse();
        env.popups.menu(e.currentTarget, revs.length ? revs.map((r, i) => ({
          label: r.text.length > 46 ? r.text.slice(0, 46) + "…" : r.text || "Empty draft",
          sub: fmt.ago(r.savedAt),
          icon: "history",
          onpick: () => { store.restoreRevision(s.draft.revisions.length - 1 - i); ta.value = st().draft.text; autosize(); updateSendStop(); }
        })) : [{ label: "No earlier revisions yet", icon: "history", disabled: true }], { title: "Draft history", width: 320 });
      });

      const un = store.subscribe(syncFromStore);
      disposers.push(un);
      syncFromStore();
      return { el: container, focus: () => ta.focus(), textarea: ta, updateSendStop };
    }

    streamEl.addEventListener("click", e => {
      const msg = e.target.closest(".pmq-msg");
      if (!msg) {
        const chapterHead = e.target.closest("[data-chapterjump]");
        return;
      }
      const msgId = msg.dataset.msgid;
      const all = store.messages(activeKey());
      const m = all.find(x => x.id === msgId);
      if (!m) return;

      const act = e.target.closest("[data-act]");
      if (act) {
        if (act.dataset.act === "copy") {
          const text = m.body;
          (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).catch(() => {});
          const span = act.querySelector("span");
          const old = span.textContent;
          span.textContent = "Copied";
          setTimeout(() => { span.textContent = old; }, 1100);
          return;
        }
        if (act.dataset.act === "edit") {
          store.setDraft(m.body);
          store.pushRevision();
          composer.textarea.value = m.body;
          composer.textarea.dispatchEvent(new Event("input", { bubbles: true }));
          composer.focus();
          env.hostApi.toast("Editing the last eligible user message");
          return;
        }
        if (act.dataset.act === "info") { moreInfoPopup(act, m); return; }
        if (act.dataset.act === "restore") {
          store.restorePointCreate(activeKey(), msgId);
          env.hostApi.toast("Restore point recorded · rewind from the Context Lens or this row");
          return;
        }
        if (act.dataset.act === "branch") {
          openBranchMenu(act, m);
          return;
        }
      }

      if (e.target.closest("[data-expand]") || e.target.closest("[data-collapse]")) {
        withAnchor(() => store.toggleLongMessage(msgId));
        return;
      }

      const agT = e.target.closest("[data-agtoggle]");
      if (agT) {
        const s = st();
        const id = agT.closest("[data-ag]").dataset.ag;
        toggleSurface("ag-" + id, () => store.mutate(() => {
          const i = s.expandedActivity.indexOf(id);
          if (i >= 0) s.expandedActivity.splice(i, 1); else s.expandedActivity.push(id);
        }));
        return;
      }

      const thT = e.target.closest("[data-thoughttoggle]");
      if (thT) {
        const s = st();
        const id = thT.closest("[data-thought]").dataset.thought;
        toggleSurface("thought-" + id, () => store.mutate(() => {
          const i = s.expandedThoughts.indexOf(id);
          if (i >= 0) s.expandedThoughts.splice(i, 1); else s.expandedThoughts.push(id);
        }));
        return;
      }

      const cqT = e.target.closest("[data-cqtoggle]");
      if (cqT) {
        const s = st();
        const raw = cqT.closest("[data-cq]").dataset.cq;
        const id = "cq:" + raw;
        toggleSurface("cq-" + raw, () => store.mutate(() => { s.expandedByIds[id] = !(s.expandedByIds[id] === true); }));
        return;
      }

      const shapeClear = e.target.closest(".pmq-shape-clear");
      if (shapeClear) { store.lensClearMessage(msgId); return; }

      const lens = st().lens;
      if (lens.mode !== "off") {
        if (lens.mode === "subcompact" || lens.mode === "mute" || lens.mode === "focus") {
          store.lensToggle(msgId);
        }
      }
    });

    /* Wrap the first text occurrence of the search needle inside a message in
       a real <mark>; cleared with the spotlight. Transcript-side companion to
       the result-snippet highlighting. */
    function markNeedle(el, needle) {
      if (!el || !needle) return null;
      const body = el.querySelector(".pmq-body");
      if (!body) return null;
      const want = needle.toLowerCase();
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      let node = null;
      while ((node = walker.nextNode())) {
        if (node.parentNode && node.parentNode.closest("code, pre, .pmq-expand-ctl, .pmq-msg-hover, mark")) continue;
        const at = node.data.toLowerCase().indexOf(want);
        if (at < 0) continue;
        const mk = document.createElement("mark");
        mk.className = "pmq-srmark";
        const hit = node.splitText(at);
        hit.splitText(want.length);
        hit.parentNode.insertBefore(mk, hit);
        mk.appendChild(hit);
        return mk;
      }
      return null;
    }

    function currentSearchNeedle() {
      const inp = document.querySelector(".pmq-search-pop input");
      return inp && inp.value ? inp.value.trim() : "";
    }

    window.PMChatNav = {
      jumpToMessage(threadKey, msgId, match, isReturn) {
        const key = activeKey();
        const s = store.thread(key);
        if (!isReturn) {
          /* Only record a return anchor when this jump actually displaces the
             reader — jumping to an already-visible message is not a position
             change, and the "Return to prior position" row must stay hidden
             until a real displacement happens. */
          const alreadyVisible = (() => {
            const cur = streamEl.querySelector('[data-msgid="' + CSS.escape(msgId) + '"]');
            if (!cur) return false;
            const r = cur.getBoundingClientRect();
            const sr = scrollerEl.getBoundingClientRect();
            return r.top >= sr.top - 8 && r.bottom <= sr.bottom + 8;
          })();
          const anchorEl = firstVisibleMsgEl();
          const anchorId = anchorEl ? (anchorEl.dataset.msgid || anchorEl.dataset.firstid) : null;
          if (anchorEl && !alreadyVisible && anchorId !== msgId) {
            store.mutate(() => {
              s.searchReturn = { threadKey: key, msgId: anchorId };
            });
          }
        }
        if (threadKey !== activeKey()) store.switchThread(threadKey);
        const all = store.messages(threadKey);
        const idx = all.findIndex(m => m.id === msgId);
        if (idx < 0) return;
        const ts = store.thread(threadKey);
        const needed = all.length - idx;
        if (ts.loadedCount < needed) {
          store.mutate(() => { ts.loadedCount = Math.min(all.length, needed + 6); });
        }
        if (window.PMChatCommands) window.PMChatCommands.dispatch("cmd.chat.search.jump", { thread_id: threadKey, message_id: msgId }, { cataloged: false });
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const el = streamEl.querySelector('[data-msgid="' + CSS.escape(msgId) + '"]');
          if (!el) return;
          el.scrollIntoView({ block: "center", behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth" });
          el.classList.add("pmq-flash", "pmq-spotlight");
          if (window.PMAnim && !A.reduced()) {
            try { el.animate([{ transform: "scale(1)" }, { transform: "scale(1.012)" }, { transform: "scale(1)" }], { duration: 340, easing: "cubic-bezier(0.22,1.15,0.36,1)" }); } catch (e) {}
          }
          const mk = !isReturn ? markNeedle(el, match || currentSearchNeedle()) : null;
          setTimeout(() => {
            el.classList.remove("pmq-flash", "pmq-spotlight");
            if (mk && mk.parentNode) mk.parentNode.replaceChild(mk.firstChild, mk);
          }, 1800);
        }));
      }
    };

    let prevIds = new Set();
    let enteredAt = {};
    let enteredEl = {};
    let animateStagger = false;
    let firstPaint = true;
    let lastRenderKey = null;

    const seenTodoComplete = new Set();
    const openTrack = {};
    function justOpened(id, isOpen) {
      const prev = openTrack[id];
      openTrack[id] = isOpen;
      return isOpen && prev !== true;
    }
    const numTrack = {};
    function numChanged(id, val) {
      const prev = numTrack[id];
      numTrack[id] = val;
      return prev !== undefined && prev !== val;
    }

    function fullRender() {
      const key = activeKey();
      const switched = key !== lastRenderKey;
      lastRenderKey = key;
      animateStagger = switched;
      renderStream();
      renderBand(key);
      const cBefore = composerEl.getBoundingClientRect();
      quest.sync();
      if (window.PMAnim && !A.reduced()) {
        try {
          if (cBefore.width > 0 && cBefore.height > 0) {
            const cAfter = composerEl.getBoundingClientRect();
            const dy = cBefore.top - cAfter.top;
            if (Math.abs(dy) > 1) {
              composerEl.animate(
                [{ transform: "translateY(" + dy + "px)" }, { transform: "none" }],
                { duration: 420, easing: "cubic-bezier(0.34,1.56,0.64,1)" }
              );
            }
          } else {
            /* Composer was hidden (display:none during an active questionnaire),
               so cBefore is a zero rect: a FLIP would compute an ~800px fly-in.
               Do a short fresh appear instead; never translate from a 0-rect. */
            const cAfter = composerEl.getBoundingClientRect();
            if (cAfter.width > 0 && cAfter.height > 0) {
              composerEl.animate(
                [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
                { duration: 220, easing: "cubic-bezier(0.22,1,0.36,1)" }
              );
            }
          }
        } catch (e) {}
      }
      if (switched) {
        const s = st();
        if (s.scrollAnchorId) restoreAnchor(s.scrollAnchorId);
        else scrollBottom(false);
      }
      composer.updateSendStop();
    }

    fullRender();
    const un = store.subscribe(() => {
      fullRender();
    });
    disposers.push(un);

    const handle = {
      update(patch) {
        if (patch && patch.contentWidthPx) {
          widthPx = patch.contentWidthPx;
          slotEl.style.setProperty("--pmq-content-w", widthPx + "px");
        }
        if (patch) Object.assign(env, { widthPx: patch.widthPx != null ? patch.widthPx : env.widthPx });
      },
      unmount() {
        recordAnchor();
        disposers.forEach(fn => { try { fn(); } catch (e) {} });
        intervals.forEach(iv => clearInterval(iv));
        intervals = [];
        if (window.PMChatNav && window.PMChatNav.jumpToMessage) delete window.PMChatNav;
        slotEl.innerHTML = "";
      },
      restoreScrollAnchor(id) { restoreAnchor(id); }
    };
    return handle;
  }

  return { mount };
})();
