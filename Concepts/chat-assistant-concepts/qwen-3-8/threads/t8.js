(() => {
  const ID = "t8";

  const GRID_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* Work-log fold memory, keyed by thread then domain: survives the per-tick
     stream rebuild. Folds start collapsed; only domains with data render. */
  const wlOpen = Object.create(null);

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

  /* ---- questionnaire: an "Interlude" chapter with a fold head ---- */

  function interludeRenderer(zoneEl, api) {
    const q = api.q;
    const store = api.store;
    const key = api.key;
    const A = api.A;
    const esc = api.esc;
    let cur = api.index();
    const foldKey = "chapter:interlude:" + q.id;

    const s0 = store.thread(key);
    const open0 = s0 && s0.expandedByIds
      ? (foldKey in s0.expandedByIds ? s0.expandedByIds[foldKey] === true : true)
      : true;

    const sec = document.createElement("section");
    sec.className = "pmq-t8-interlude" + (open0 ? "" : " pmq-ch-folded");
    sec.innerHTML =
      '<header class="pmq-chapter-head" data-ifold aria-expanded="' + open0 + '">' +
        '<i data-ico="question"></i>' +
        '<span>Interlude \u00b7 Questions</span>' +
        '<span class="pmq-chapter-n" data-inum></span>' +
      "</header>" +
      api.gridWrap(open0,
        '<div class="pmq-chapter-body pmq-t8-ibody">' +
          '<div class="pmq-t8-qcard">' +
            '<div class="pmq-t8-qtop">' +
              '<span class="pmq-t8-qkicker">Question <span class="pmq-t8-qnum" data-qnum></span></span>' +
              '<button class="pmq-btn pmq-btn-icon" type="button" data-qcancel aria-label="Cancel questionnaire"><i data-ico="close"></i></button>' +
            "</div>" +
            '<div class="pmq-t8-qslide" data-qslide></div>' +
            '<div class="pmq-t8-qfoot">' +
              '<button class="pmq-btn" type="button" data-qprev><i data-ico="chevRight" style="transform:scaleX(-1)"></i>Previous</button>' +
              '<button class="pmq-btn" type="button" data-qskip>Skip this question</button>' +
              '<button class="pmq-btn pmq-btn-primary" type="button" data-qnext>Next<i data-ico="chevRight"></i></button>' +
              '<button class="pmq-btn pmq-btn-primary" type="button" data-qsubmit>Submit questionnaire</button>' +
            "</div>" +
          "</div>" +
        "</div>", "pmq-t8-page pmq-t8-igrow", "t8interlude");
    zoneEl.appendChild(sec);
    window.PMIcons.hydrate(sec);

    const head = sec.querySelector("[data-ifold]");
    const wrap = sec.querySelector(".pmq-gw");
    const inumEl = sec.querySelector("[data-inum]");
    const qnumEl = sec.querySelector("[data-qnum]");
    const slideEl = sec.querySelector("[data-qslide]");
    const prevBtn = sec.querySelector("[data-qprev]");
    const skipBtn = sec.querySelector("[data-qskip]");
    const nextBtn = sec.querySelector("[data-qnext]");
    const submitBtn = sec.querySelector("[data-qsubmit]");

    function slideHtml(x) {
      const ans = api.answer(x);
      let body = "";
      if (x.kind === "freeform") {
        body = '<textarea class="pmq-t8-qfree" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + esc(ans.draft || "") + "</textarea>";
      } else {
        const multi = x.kind === "multi select";
        body = '<div class="pmq-t8-qopts">' + x.options.map(o => {
          const on = (ans.selected || []).includes(o);
          return '<button class="pmq-t8-qopt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + esc(o) + '" aria-pressed="' + on + '">' +
            '<span class="pmq-t8-qmark">' + (multi ? '<i data-ico="check"></i>' : "") + "</span><span>" + esc(o) + "</span></button>";
        }).join("") + "</div>";
      }
      return '<div class="pmq-t8-qprompt">' + esc(x.prompt) + (x.required ? "" : ' <span class="pmq-t8-qoptional">Optional</span>') + "</div>" + body;
    }

    function paintSlide() {
      slideEl.innerHTML = slideHtml(q.questions[cur]);
      window.PMIcons.hydrate(slideEl);
    }

    function chrome(crossfade) {
      const last = cur >= q.questions.length - 1;
      const headText = "Question " + (cur + 1) + " of " + q.questions.length;
      if (inumEl && inumEl.textContent !== headText) {
        if (crossfade) A.crossfadeNum(inumEl, headText);
        else inumEl.textContent = headText;
      }
      const kickText = (cur + 1) + " of " + q.questions.length;
      if (qnumEl && qnumEl.textContent !== kickText) {
        if (crossfade) A.crossfadeNum(qnumEl, kickText);
        else qnumEl.textContent = kickText;
      }
      prevBtn.disabled = cur === 0;
      skipBtn.hidden = last;
      nextBtn.hidden = last;
      submitBtn.hidden = !last;
      submitBtn.disabled = !api.valid();
    }

    /* Question change: swap content, interpolate the slide bounds (240ms). */
    function swapSlide() {
      const hOld = slideEl.offsetHeight;
      paintSlide();
      chrome(true);
      if (api.reduced()) return;
      const hNew = slideEl.offsetHeight;
      if (!hOld || Math.abs(hOld - hNew) < 2) return;
      try {
        slideEl.style.overflow = "hidden";
        slideEl.animate(
          [{ height: hOld + "px", opacity: 0.5 }, { height: hNew + "px", opacity: 1 }],
          { duration: 240, easing: GRID_EASE }
        ).finished.then(() => { slideEl.style.overflow = ""; }).catch(() => { slideEl.style.overflow = ""; });
      } catch (e) { slideEl.style.overflow = ""; }
    }

    /* Fold head: same grid-rows fold as day chapters, silent state write. */
    head.addEventListener("click", () => {
      const s = store.thread(key);
      const willOpen = sec.classList.contains("pmq-ch-folded");
      if (s && s.expandedByIds) s.expandedByIds[foldKey] = willOpen;
      sec.classList.toggle("pmq-ch-folded", !willOpen);
      if (wrap) wrap.classList.toggle("pmq-open", willOpen);
      head.setAttribute("aria-expanded", String(willOpen));
    });

    sec.addEventListener("click", e => {
      if (e.target.closest("[data-ifold]")) return;
      if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
      const opt = e.target.closest("[data-opt]");
      if (opt) api.select(q.questions[cur], opt.dataset.opt);
    });
    sec.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(q.questions[cur], e.target.value);
    });

    paintSlide();
    chrome(false);

    if (!api.reduced()) {
      try {
        sec.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 320, easing: GRID_EASE }
        );
      } catch (e) {}
    }

    return {
      update(nq, idx) {
        if (idx !== cur) { cur = idx; swapSlide(); return; }
        const x = q.questions[cur];
        if (x.kind !== "freeform") {
          const ans = api.answer(x);
          sec.querySelectorAll(".pmq-t8-qopt").forEach(o => {
            const on = (ans.selected || []).includes(o.dataset.opt);
            o.classList.toggle("pmq-on", on);
            o.setAttribute("aria-pressed", String(on));
          });
        }
        chrome(true);
      },
      unmount() { if (sec.parentNode) sec.parentNode.removeChild(sec); }
    };
  }

  /* ---- work surfaces: chapter-style "Work log" folds, one per domain ---- */

  function workLogRender(container, key, wapi) {
    const store = wapi.store;
    const esc = wapi.esc;
    const d = wapi.data;
    const b = wapi.builders;

    const domains = [];
    if (d.goalStatus) domains.push({ id: "goal", ico: "goal", label: "Goal", count: cap(d.goalStatus), cards: () => [b.goalCard(key)] });
    if (d.todoTotal) domains.push({ id: "tasks", ico: "todo", label: "Tasks", count: d.todoDone + " of " + d.todoTotal, cards: () => [b.todoCard(key)] });
    if (d.agents) domains.push({ id: "agents", ico: "agents", label: "Agents", count: String(d.agents), cards: () => b.subagentCards(key) });
    if (d.diffFiles) domains.push({ id: "diffs", ico: "diff", label: "Diffs", count: "+" + d.diffAdds + " \u2212" + d.diffDels, cards: () => b.diffCards(key) });
    if (d.live) domains.push({ id: "activity", ico: "activity", label: "Activity", count: (d.live.stages ? d.live.stages.length : 0) + " steps", cards: () => [b.activityLiveCard(key)] });
    const alerts = (d.approvals || 0) + (d.warnings || 0);
    if (alerts || d.grant || d.capacity) domains.push({ id: "alerts", ico: "warn", label: "Alerts", count: String(alerts + (d.grant ? 1 : 0) + (d.capacity || 0)), cards: () => {
        const cards = b.approvalCards(key);
        const grant = b.grantCard(key);
        if (grant) cards.push(grant);
        b.capacityCards(key).forEach(c => cards.push(c));
        return cards.concat(b.warningCards(key));
      } });
    if (d.ops > 0) domains.push({ id: "ops", ico: "branch", label: "Ops", count: String(d.ops), cards: () => b.opsCards(key) });
    if (d.bsd > 0) domains.push({ id: "bsd", ico: "sparkle", label: "BSD", count: String(d.bsd), cards: () => b.bsdCards(key) });
    if (d.attach > 0) domains.push({ id: "attach", ico: "attach", label: "Attachments", count: String(d.attach), cards: () => b.attachmentResolutionCards(key) });
    const t8Arts = b.artifactCards(key);
    if (t8Arts.length) domains.push({ id: "artifacts", ico: "layers", label: "Artifacts", count: String(t8Arts.length), cards: () => b.artifactCards(key) });
    if (!domains.length) return;

    const openMap = wlOpen[key] || (wlOpen[key] = {});
    const log = document.createElement("section");
    log.className = "pmq-t8-worklog";
    log.setAttribute("aria-label", "Work log");

    domains.forEach(dom => {
      const open = openMap[dom.id] === true;
      const fold = document.createElement("div");
      fold.className = "pmq-t8-wl-fold" + (open ? " pmq-open" : "");
      fold.dataset.wl = dom.id;
      fold.innerHTML =
        '<button class="pmq-chapter-head pmq-t8-wl-head" type="button" data-wltoggle="' + dom.id + '" aria-expanded="' + open + '">' +
          '<i data-ico="' + dom.ico + '"></i>' +
          '<span>' + esc(dom.label) + "</span>" +
          '<span class="pmq-chapter-n">' + esc(dom.count) + "</span>" +
        "</button>" +
        (open ? wapi.gridWrap(true, '<div class="pmq-chapter-body pmq-t8-wl-body"></div>', "pmq-t8-page", "t8wl-" + dom.id) : "");
      if (open) {
        const holder = fold.querySelector(".pmq-t8-wl-body");
        dom.cards().forEach(card => { if (card) holder.appendChild(card); });
      }
      fold.querySelector("[data-wltoggle]").addEventListener("click", () => {
        wapi.toggleSurface("t8wl-" + dom.id, () => store.mutate(() => { openMap[dom.id] = !open; }));
      });
      log.appendChild(fold);
    });

    container.appendChild(log);
  }

  function mount(slotEl, ctx) {
    const env = ctx.env;
    const store = env.store;
    const fmt = window.PMFmt;

    /* Chapters entrance: a page turn — the leaf swings in on a perspective
       rotateY hinged at its left edge, visibly mid-turn at any mid-frame. */
    function enterMsg(el, index) {
      if (!window.PMAnim || window.PMAnim.reduced()) return;
      try {
        el.animate(
          [
            { opacity: 0, transform: "perspective(700px) rotateY(-10deg) translateX(-6px)", transformOrigin: "left center" },
            { opacity: 1, transform: "perspective(700px) rotateY(0deg) translateX(0)", transformOrigin: "left center" }
          ],
          { duration: 420, delay: Math.min(index * 40, 240), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
      } catch (e) {}
    }

    const handle = window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "chapters",
      rootClass: "pmq-t8",
      chapters: true,
      enterMsg,
      messageClass: () => "pmq-t8-msg",
      questRenderer: interludeRenderer,
      workRender: workLogRender
    });

    const scroller = slotEl.querySelector(".pmq-scroller");
    const stream = slotEl.querySelector(".pmq-stream");

    /* The Latest pill docks into the timeline rail (icon-only node) so it
       never overlaps prose; restore the lost text as an accessible label. */
    const jumpPill = slotEl.querySelector(".pmq-jump-pill");
    if (jumpPill) jumpPill.setAttribute("aria-label", "Jump to latest");

    const bar = document.createElement("div");
    bar.className = "pmq-t8-bar";
    bar.innerHTML = '<span class="pmq-t8-bar-cur"><i data-ico="calendar"></i><span class="pmq-t8-bar-label"></span></span>' +
      '<button type="button" class="pmq-t8-map"><i data-ico="calendar"></i><span>Chapters</span></button>';
    window.PMIcons.hydrate(bar);
    scroller.insertBefore(bar, stream);
    const labelEl = bar.querySelector(".pmq-t8-bar-label");
    const mapBtn = bar.querySelector(".pmq-t8-map");
    mapBtn.addEventListener("click", () => {
      const days = [];
      store.messages(store.activeKey()).forEach(m => {
        const k = fmt.dayKey(m.sentAt);
        const found = days.find(d => d.k === k);
        if (found) found.n++;
        else days.push({ k, label: fmt.dayLabel(m.sentAt), n: 1 });
      });
      const items = days.map(d => ({
        label: d.label,
        sub: d.n + " messages",
        icon: "calendar",
        onpick: () => {
          const el = slotEl.querySelector('.pmq-chapter[data-day="' + d.k + '"]');
          if (el) el.scrollIntoView({ behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth", block: "start" });
        }
      }));
      const iq = store.activeQuestionnaire(store.activeKey());
      if (iq) {
        items.push({
          label: "Interlude \u00b7 Questions",
          sub: "Question " + (store.questIndex(iq, store.activeKey()) + 1) + " of " + iq.questions.length,
          icon: "question",
          onpick: () => {
            const el = slotEl.querySelector(".pmq-t8-interlude");
            if (el) el.scrollIntoView({ behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth", block: "start" });
          }
        });
      }
      window.PMChatPopups.menu(mapBtn, items, { title: "Chapters", width: 230 });
    });

    /* Page-turn fold: wrap each chapter body in a grid-rows wrapper after
       every stream rebuild, and let the head toggle it in place (silent
       state write, no store emit) so the 0fr <-> 1fr transition runs
       without the per-tick rebuild replaying anything. */
    function chapterOpenState(day) {
      const s = store.thread(store.activeKey());
      const ex = s && s.expandedByIds;
      const key = "chapter:" + day;
      return ex ? (key in ex ? ex[key] === true : true) : true;
    }

    function processChapters() {
      stream.querySelectorAll(".pmq-chapter").forEach(ch => {
        if (ch.dataset.t8bound) return;
        ch.dataset.t8bound = "1";
        const day = ch.dataset.day;
        const key = "chapter:" + day;
        const open = chapterOpenState(day);
        ch.classList.toggle("pmq-ch-folded", !open);

        const body = ch.querySelector(":scope > .pmq-chapter-body");
        if (body) {
          const gw = document.createElement("div");
          gw.className = "pmq-gw pmq-t8-page" + (open ? " pmq-open" : "");
          const gwi = document.createElement("div");
          gwi.className = "pmq-gwi";
          gw.appendChild(gwi);
          ch.insertBefore(gw, body);
          gwi.appendChild(body);
        }

        const head = ch.querySelector(":scope > .pmq-chapter-head");
        if (head) {
          head.setAttribute("aria-expanded", String(open));
          head.addEventListener("click", () => {
            const s = store.thread(store.activeKey());
            const willOpen = ch.classList.contains("pmq-ch-folded");
            if (s && s.expandedByIds) s.expandedByIds[key] = willOpen;
            ch.classList.toggle("pmq-ch-folded", !willOpen);
            const wrap = ch.querySelector(":scope > .pmq-gw");
            if (wrap) wrap.classList.toggle("pmq-open", willOpen);
            head.setAttribute("aria-expanded", String(willOpen));
          });
        }
      });
    }

    const mo = new MutationObserver(processChapters);
    mo.observe(stream, { childList: true });
    processChapters();

    function updateCur() {
      /* Day-chapter heads only: work-log fold heads share the head class but
         never drive the current-chapter marker. */
      const heads = [...stream.querySelectorAll(".pmq-chapter > .pmq-chapter-head")];
      if (!heads.length) return;
      const stop = scroller.getBoundingClientRect().top;
      let cur = heads[0];
      for (const h of heads) { if (h.getBoundingClientRect().top - stop <= 40) cur = h; else break; }
      heads.forEach(h => h.classList.toggle("pmq-t8-cur", h === cur));
      const sp = cur.querySelector("span");
      labelEl.textContent = sp ? sp.textContent : cur.textContent;
    }
    scroller.addEventListener("scroll", updateCur, { passive: true });
    updateCur();

    return Object.assign({}, handle, {
      unmount() {
        try { mo.disconnect(); } catch (e) {}
        handle.unmount();
      }
    });
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
