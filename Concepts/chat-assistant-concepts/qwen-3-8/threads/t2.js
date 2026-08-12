(() => {
  const ID = "t2";

  const GOAL_LABELS = { running: "Running", paused: "Paused", blocked: "Blocked", stopped: "Stopped", complete: "Complete" };

  /* The one open work sidecar (env.popups allows a single active popup).
     Tracked here so each store tick can re-anchor and re-fill it in place. */
  const workPopup = { entry: null, domain: null, body: null, key: null };
  function clearWorkPopup() { workPopup.entry = null; workPopup.domain = null; workPopup.body = null; workPopup.key = null; }

  function prevAssistantPersona(api, msg) {
    const all = api.store.messages(api.store.activeKey());
    const idx = all.findIndex(m => m.id === msg.id);
    for (let i = idx - 1; i >= 0; i--) {
      if (all[i].role === "assistant") return all[i].runtime && all[i].runtime.persona;
    }
    return null;
  }

  /* Turn-plates entrance: the plate drops into the stack with a snap-spring
     (a 26px drop + scale-down settling to rest); user plates arrive from the
     right, assistant plates from the left. */
  function enterMsg(el, index, role) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    const x = role === "user" ? "16px" : "-16px";
    try {
      el.animate(
        [{ opacity: 0, transform: "translate(" + x + ", 26px) scale(0.96)" }, { opacity: 1, transform: "none" }],
        { duration: 420, delay: Math.min(index * 40, 240), easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "backwards" }
      );
    } catch (e) {}
  }

  /* ---- questionnaire: the questionnaire IS a turn plate ---- */

  function questSlideHtml(api, question) {
    const ans = api.answer(question) || {};
    if (question.kind === "freeform") {
      return '<div class="pmq-t2q-prompt">' + api.esc(question.prompt) + "</div>" +
        '<textarea class="pmq-t2q-free" rows="3" spellcheck="true" placeholder="Add a note" data-free>' + api.esc(ans.draft || "") + "</textarea>";
    }
    const multi = question.kind === "multi select";
    const opts = question.options.map(o => {
      const on = (ans.selected || []).includes(o);
      return '<button class="pmq-t2q-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + api.esc(o) + '" aria-pressed="' + on + '">' +
        '<span class="pmq-t2q-mark' + (multi ? "" : " pmq-t2q-mark-radio") + '">' + (multi ? '<i data-ico="check"></i>' : "") + "</span>" +
        '<span class="pmq-t2q-opttext">' + api.esc(o) + "</span></button>";
    }).join("");
    return '<div class="pmq-t2q-prompt">' + api.esc(question.prompt) +
      (question.required ? "" : ' <span class="pmq-t2q-optional">Optional</span>') + "</div>" +
      '<div class="pmq-t2q-opts">' + opts + "</div>";
  }

  function questRenderer(zoneEl, api) {
    const el = document.createElement("div");
    el.className = "pmq-t2-quest";
    let lastIdx = api.index();
    el.innerHTML =
      '<div class="pmq-plate-head pmq-t2q-head">' +
        '<i class="pmq-plate-glyph" data-ico="question"></i>' +
        '<span class="pmq-plate-sender">Puppet Master asks</span>' +
        '<span class="pmq-t2q-chip" data-qnum>' + (lastIdx + 1) + " of " + api.q.questions.length + "</span>" +
        '<button class="pmq-t2q-x" type="button" data-qx aria-label="Cancel questionnaire" title="Cancel questionnaire">×</button>' +
      "</div>" +
      '<div class="pmq-t2q-body"><div class="pmq-t2q-slide">' + questSlideHtml(api, api.q.questions[lastIdx]) + "</div></div>" +
      '<div class="pmq-t2q-foot">' +
        '<button class="pmq-btn" type="button" data-qskip>Skip</button>' +
        '<span class="pmq-t2q-spacer"></span>' +
        '<button class="pmq-btn" type="button" data-qprev>Previous</button>' +
        '<button class="pmq-btn" type="button" data-qnext>Next</button>' +
        '<button class="pmq-btn pmq-btn-primary" type="button" data-qsubmit hidden>Submit</button>' +
      "</div>";
    zoneEl.appendChild(el);
    window.PMIcons.hydrate(el);

    /* Plate entrance: border already set — a short fade on a 4px rise. */
    if (!api.reduced()) {
      try {
        el.animate(
          [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
          { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        );
      } catch (e) {}
    }

    const body = el.querySelector(".pmq-t2q-body");

    function chrome(q, idx) {
      const last = idx >= q.questions.length - 1;
      const numCell = el.querySelector("[data-qnum]");
      const numText = (idx + 1) + " of " + q.questions.length;
      if (numCell && numCell.textContent !== numText) api.A.crossfadeNum(numCell, numText);
      const prev = el.querySelector("[data-qprev]");
      const next = el.querySelector("[data-qnext]");
      const skip = el.querySelector("[data-qskip]");
      const submit = el.querySelector("[data-qsubmit]");
      if (prev) prev.disabled = idx === 0;
      if (next) next.hidden = last;
      if (skip) skip.hidden = last;
      if (submit) { submit.hidden = !last; submit.disabled = !api.valid(); }
    }

    function refreshSlide(q, idx) {
      const question = q.questions[idx];
      const ans = api.answer(question) || {};
      if (question.kind === "freeform") {
        const ta = body.querySelector("[data-free]");
        if (ta && document.activeElement !== ta && ta.value !== (ans.draft || "")) ta.value = ans.draft || "";
        return;
      }
      body.querySelectorAll(".pmq-t2q-opt").forEach(opt => {
        const on = (ans.selected || []).includes(opt.dataset.opt);
        opt.classList.toggle("pmq-on", on);
        opt.setAttribute("aria-pressed", String(on));
      });
    }

    function toSlide(q, idx) {
      const old = body.querySelector(".pmq-t2q-slide");
      const incoming = document.createElement("div");
      incoming.className = "pmq-t2q-slide";
      incoming.innerHTML = questSlideHtml(api, q.questions[idx]);
      window.PMIcons.hydrate(incoming);
      if (api.reduced() || !old || typeof old.animate !== "function") {
        if (old) old.remove();
        body.appendChild(incoming);
        return;
      }
      body.appendChild(incoming);
      try {
        old.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 140, easing: "cubic-bezier(0.4, 0, 1, 1)" }
        ).finished.then(() => { if (old.parentNode) old.remove(); }).catch(() => { if (old.parentNode) old.remove(); });
        incoming.animate(
          [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
          { duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
      } catch (e) { if (old.parentNode) old.remove(); }
    }

    el.addEventListener("click", e => {
      const question = api.q.questions[api.index()];
      const opt = e.target.closest("[data-opt]");
      if (opt) { api.select(question, opt.dataset.opt); return; }
      if (e.target.closest("[data-qx]")) { api.cancel(); return; }
      if (e.target.closest("[data-qprev]")) { api.prev(); return; }
      if (e.target.closest("[data-qnext]")) { api.next(); return; }
      if (e.target.closest("[data-qskip]")) { api.skip(); return; }
      if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
    });

    el.addEventListener("input", e => {
      if (e.target.matches("[data-free]")) api.setFree(api.q.questions[api.index()], e.target.value);
    });

    chrome(api.q, lastIdx);

    return {
      update(q, idx) {
        if (idx !== lastIdx) { toSlide(q, idx); lastIdx = idx; }
        else refreshSlide(q, idx);
        chrome(q, idx);
      },
      unmount() { if (el.parentNode) el.parentNode.removeChild(el); }
    };
  }

  /* ---- work: a row of small plate chips opening sidecar popovers ---- */

  function workDomainCards(domain, key, wapi) {
    const b = wapi.builders;
    const cards = [];
    if (domain === "goal") {
      const c = b.goalCard(key);
      if (c) cards.push(c);
    } else if (domain === "tasks") {
      const c = b.todoCard(key);
      if (c) cards.push(c);
    } else if (domain === "agents") {
      b.subagentCards(key).forEach(c => cards.push(c));
      const crew = b.crewCard(key);
      if (crew) cards.push(crew);
    } else if (domain === "diff") {
      b.diffCards(key).forEach(c => cards.push(c));
    } else if (domain === "alerts") {
      b.approvalCards(key).forEach(c => cards.push(c));
      const grant = b.grantCard(key);
      if (grant) cards.push(grant);
      b.capacityCards(key).forEach(c => cards.push(c));
      b.warningCards(key).forEach(c => cards.push(c));
    } else if (domain === "ops") {
      b.opsCards(key).forEach(c => cards.push(c));
    } else if (domain === "bsd") {
      b.bsdCards(key).forEach(c => cards.push(c));
    } else if (domain === "attach") {
      b.attachmentResolutionCards(key).forEach(c => cards.push(c));
    } else if (domain === "artifacts") {
      b.artifactCards(key).forEach(c => cards.push(c));
    }
    return cards;
  }

  function fillWorkPopupBody(bodyEl, domain, key, wapi) {
    bodyEl.innerHTML = "";
    const cards = workDomainCards(domain, key, wapi);
    if (!cards.length) {
      const none = document.createElement("div");
      none.className = "pmq-t2-wpop-none";
      none.textContent = "Nothing here right now.";
      bodyEl.appendChild(none);
      return;
    }
    cards.forEach(c => bodyEl.appendChild(c));
  }

  function workRender(container, key, wapi) {
    const d = wapi.data;
    const hasDiff = d.diffAdds > 0 || d.diffDels > 0;
    const alerts = d.approvals + d.warnings;

    /* Drop tracking when the popup was closed elsewhere (outside click, Esc,
       or replaced by another popup). */
    if (workPopup.entry && wapi.env.popups.getActive() !== workPopup.entry) clearWorkPopup();
    if (workPopup.entry && workPopup.key !== key) {
      try { wapi.env.popups.dismiss(workPopup.entry); } catch (e) {}
      clearWorkPopup();
    }

    const chipDefs = [];
    if (d.goalStatus) chipDefs.push({ domain: "goal", ico: "goal", label: "Goal", val: d.goalPhase || GOAL_LABELS[d.goalStatus] || d.goalStatus, cell: "goal" });
    if (d.todoTotal > 0) chipDefs.push({ domain: "tasks", ico: "todo", label: "Tasks", val: d.todoDone + "/" + d.todoTotal, cell: "todo" });
    if (d.agents > 0) chipDefs.push({ domain: "agents", ico: "agents", label: "Agents", val: String(d.agents), cell: "agents" });
    if (hasDiff) chipDefs.push({ domain: "diff", ico: "diff", label: "Diff", val: "+" + d.diffAdds + " −" + d.diffDels, cell: "diff" });
    if (alerts > 0) chipDefs.push({ domain: "alerts", ico: "warn", label: "Alerts", val: String(alerts), cell: "alerts" });
    if (d.ops > 0) chipDefs.push({ domain: "ops", ico: "branch", label: "Ops", val: String(d.ops), cell: "ops" });
    if (d.bsd > 0) chipDefs.push({ domain: "bsd", ico: "sparkle", label: "BSD", val: String(d.bsd), cell: "bsd" });
    if (d.attach > 0) chipDefs.push({ domain: "attach", ico: "attach", label: "Attach", val: String(d.attach), cell: "attach" });
    chipDefs.push({ domain: "artifacts", ico: "layers", label: "Artifacts", val: String(wapi.store.threadArtifacts(key).length), cell: "artifacts" });
    if (!chipDefs.length) return;

    const row = document.createElement("div");
    row.className = "pmq-t2-workchips";
    chipDefs.forEach(c => {
      const b = document.createElement("button");
      b.className = "pmq-t2-wchip";
      b.type = "button";
      b.dataset.domain = c.domain;
      b.setAttribute("aria-expanded", String(workPopup.entry && workPopup.domain === c.domain));
      b.innerHTML = '<i data-ico="' + c.ico + '"></i><span class="pmq-t2-wlabel">' + c.label +
        '</span><span class="pmq-t2-wval" data-wcell="' + c.cell + '">' + wapi.esc(String(c.val)) + "</span>";
      row.appendChild(b);
    });
    window.PMIcons.hydrate(row);
    container.appendChild(row);

    const morph = (name, id, text) => {
      const cell = row.querySelector('[data-wcell="' + name + '"]');
      if (cell && wapi.numChanged(id, text)) wapi.A.crossfadeNum(cell, text);
    };
    if (d.goalStatus) morph("goal", "t2goal:" + key, d.goalPhase || GOAL_LABELS[d.goalStatus] || d.goalStatus);
    if (d.todoTotal > 0) morph("todo", "t2todo:" + key, d.todoDone + "/" + d.todoTotal);
    if (d.agents > 0) morph("agents", "t2agents:" + key, String(d.agents));
    if (hasDiff) morph("diff", "t2diff:" + key, "+" + d.diffAdds + " −" + d.diffDels);
    if (alerts > 0) morph("alerts", "t2alerts:" + key, String(alerts));

    row.addEventListener("click", e => {
      const chip = e.target.closest("[data-domain]");
      if (!chip) return;
      const domain = chip.dataset.domain;
      if (workPopup.entry && workPopup.domain === domain && wapi.env.popups.getActive() === workPopup.entry) {
        wapi.env.popups.dismiss(workPopup.entry);
        clearWorkPopup();
        return;
      }
      const def = chipDefs.find(x => x.domain === domain);
      const wrapEl = document.createElement("div");
      wrapEl.className = "pmq-t2-wpop";
      const head = document.createElement("div");
      head.className = "pmq-popup-head";
      head.innerHTML = '<i data-ico="' + def.ico + '"></i>' + def.label;
      const bodyEl = document.createElement("div");
      bodyEl.className = "pmq-popup-body pmq-t2-wpop-body";
      wrapEl.appendChild(head);
      wrapEl.appendChild(bodyEl);
      window.PMIcons.hydrate(head);
      fillWorkPopupBody(bodyEl, domain, key, wapi);
      const entry = wapi.env.popups.open(chip, wrapEl, {
        width: 320,
        title: def.label,
        onclose: () => { if (workPopup.entry === entry) clearWorkPopup(); }
      });
      workPopup.entry = entry;
      workPopup.domain = domain;
      workPopup.body = bodyEl;
      workPopup.key = key;
    });

    /* The chip row is rebuilt every store tick; keep an open sidecar live by
       re-anchoring it to the fresh chip and re-filling its cards in place. */
    if (workPopup.entry && workPopup.key === key && workPopup.body && wapi.env.popups.getActive() === workPopup.entry) {
      const chip = row.querySelector('[data-domain="' + workPopup.domain + '"]');
      if (chip) workPopup.entry.anchor = chip;
      fillWorkPopupBody(workPopup.body, workPopup.domain, key, wapi);
    }
  }

  function mount(slotEl, ctx) {
    const handle = window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "plates",
      rootClass: "pmq-t2",
      enterMsg,
      questRenderer,
      workRender,
      messageClass: () => "pmq-t2-msg",
      decorate(el, msg, api) {
        const inner = el.querySelector(".pmq-msg-inner");
        const rt = msg.runtime || {};
        const isUser = msg.role === "user";
        let sender = "You";
        if (!isUser) {
          const persona = rt.persona;
          sender = persona && persona !== prevAssistantPersona(api, msg)
            ? api.fmt.esc(persona) + " · Assistant"
            : "Assistant";
        }
        const head = document.createElement("div");
        head.className = "pmq-plate-head";
        head.innerHTML =
          '<i class="pmq-plate-glyph" data-ico="' + (isUser ? "agents" : "sparkle") + '"></i>' +
          '<span class="pmq-plate-sender">' + sender + "</span>" +
          (rt.model ? '<span class="pmq-plate-model">' + api.fmt.esc(rt.model) + "</span>" : "") +
          '<span class="pmq-plate-time">' + api.fmt.clock(msg.sentAt) + "</span>";
        window.PMIcons.hydrate(head);
        inner.prepend(head);
      }
    });

    /* The meta footer of a plate scrolled past the top crop reads as an
       orphan band floating at the viewport edge — fade it away the moment
       its plate head has left the viewport, restore it on scroll-back. */
    const scroller = slotEl.querySelector(".pmq-scroller");
    const stream = slotEl.querySelector(".pmq-stream");
    function clipOrphanFooters() {
      if (!scroller || !stream) return;
      const top = scroller.getBoundingClientRect().top;
      stream.querySelectorAll(".pmq-msg").forEach(m => {
        const foot = m.querySelector(".pmq-msg-hover");
        if (!foot) return;
        const orphan = m.getBoundingClientRect().top < top - 2 &&
          foot.getBoundingClientRect().top - top < 34;
        m.classList.toggle("pmq-t2-footless", orphan);
      });
    }
    let mo = null;
    if (scroller && stream) {
      scroller.addEventListener("scroll", clipOrphanFooters, { passive: true });
      mo = new MutationObserver(clipOrphanFooters);
      mo.observe(stream, { childList: true });
      clipOrphanFooters();
    }

    return Object.assign({}, handle, {
      unmount() {
        try { if (mo) mo.disconnect(); } catch (e) {}
        try { if (workPopup.entry) ctx.env.popups.dismiss(workPopup.entry); } catch (e) {}
        clearWorkPopup();
        handle.unmount();
      }
    });
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
