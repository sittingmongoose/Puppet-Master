(() => {
  const ID = "t5";
  const CONDENSE_AT = 150;
  const SNIPPET_CHARS = 110;
  const QCAP_CHARS = 42;
  const GRID_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* Single-detail memory for the work chip strip: only ONE chip may hold an
     expanded detail plate at a time. Module-level on purpose — the stream is
     rebuilt every store tick, so the open domain must outlive its own DOM. */
  let workOpenDomain = null;

  function personaOf(msg) {
    return (msg.runtime && msg.runtime.persona) || "";
  }

  function flatSnippet(text) {
    const flat = String(text || "").replace(/\s+/g, " ").trim();
    return flat.length > SNIPPET_CHARS ? flat.slice(0, SNIPPET_CHARS).trimEnd() + "\u2026" : flat;
  }

  function trunc(text, n) {
    const flat = String(text || "").replace(/\s+/g, " ").trim();
    return flat.length > n ? flat.slice(0, n).trimEnd() + "\u2026" : flat;
  }

  /* Condenser entrance: the row files in and compacts — a visible drop plus
     a vertical squash easing out to rest, like a ledger entry being pressed
     into place. */
  function enterMsg(el, index) {
    if (!window.PMAnim || window.PMAnim.reduced()) return;
    try {
      el.animate(
        [
          { opacity: 0, transform: "translateY(16px) scaleY(0.9)", transformOrigin: "center top" },
          { opacity: 1, transform: "none", transformOrigin: "center top" }
        ],
        { duration: 400, delay: Math.min(index * 40, 240), easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
      );
    } catch (e) {}
  }

  /* WAAPI driver for renderer-owned grid-rows wrappers. Minimal motion:
     120-180ms, and reduced motion / no WAAPI degrades to the static
     end-state (the authored class already holds it). */
  function gridAnim(wrap, from, to, dur, reduced) {
    if (reduced || !wrap || typeof wrap.animate !== "function") return;
    wrap.style.transition = "none";
    wrap.style.gridTemplateRows = from;
    void wrap.offsetHeight;
    let anim = null;
    try {
      anim = wrap.animate([{ gridTemplateRows: from }, { gridTemplateRows: to }], { duration: dur, easing: GRID_EASE });
    } catch (e) { anim = null; }
    const done = () => { wrap.style.gridTemplateRows = ""; wrap.style.transition = ""; };
    if (anim && anim.finished) { anim.finished.then(done).catch(done); } else { done(); }
  }

  /* ---- quest: condensed capsule that expands in place ----
     Collapsed = one capsule row [Q i/n chip · prompt 42ch]; it auto-expands
     via a grid-rows plate into option ledger rows. Progress lives in the
     counter chip (crossfade). One question visible; Skip skips one question
     and stays visible on every question page; Cancel ends the flow; the last
     question carries Review answers (disabled until valid), which keeps the
     capsule expanded into a ledger of every answer with Back + Submit. */
  function questRenderer(zoneEl, api) {
    const q = api.q;

    let root = null, cap = null, count = null, snip = null, gw = null, body = null;
    let lastIdx = api.index();
    let lastCount = "";
    let reviewing = false;
    let built = false;
    let dead = false;
    let timer = 0;

    function slideHtml(question) {
      const ans = api.answer(question);
      let main;
      if (question.kind === "freeform") {
        main = '<textarea class="pmq-t5q-free" rows="2" spellcheck="true" placeholder="Add a note" data-free>' + api.esc(ans.draft || "") + "</textarea>";
      } else {
        main = '<div class="pmq-t5q-opts">' + question.options.map(o => {
          const on = (ans.selected || []).includes(o);
          return '<button class="pmq-t5q-opt' + (on ? " pmq-on" : "") + '" type="button" data-opt="' + api.esc(o) + '" aria-pressed="' + on + '">' +
            '<i data-ico="check"></i><span>' + api.esc(o) + "</span></button>";
        }).join("") + "</div>";
      }
      return '<div class="pmq-t5q-prompt">' + api.esc(question.prompt) +
        (question.required ? "" : '<span class="pmq-t5q-optional">Optional</span>') + "</div>" + main;
    }

    function footHtml(idx) {
      const last = idx >= q.questions.length - 1;
      return '<button class="pmq-btn pmq-t5q-btn" type="button" data-qprev' + (idx === 0 ? " disabled" : "") + ">Prev</button>" +
        '<button class="pmq-btn pmq-t5q-btn" type="button" data-qskip>Skip</button>' +
        '<span class="pmq-t5q-spacer"></span>' +
        '<button class="pmq-btn pmq-t5q-btn" type="button" data-qcancel>Cancel</button>' +
        (last
          ? '<button class="pmq-btn pmq-btn-primary pmq-t5q-btn" type="button" data-qreview' + (api.valid() ? "" : " disabled") + ">Review answers</button>"
          : '<button class="pmq-btn pmq-btn-primary pmq-t5q-btn" type="button" data-qnext>Next</button>');
    }

    function paintBody(idx) {
      body.innerHTML = slideHtml(q.questions[idx]) +
        '<div class="pmq-t5q-foot">' + footHtml(idx) + "</div>";
      window.PMIcons.hydrate(body);
    }

    /* Review page (video 02): the capsule stays expanded and its ledger lists
       every answer as a row with a per-question back link. */
    function paintReview() {
      body.innerHTML = api.reviewHtml() +
        '<div class="pmq-t5q-foot">' +
          '<button class="pmq-btn pmq-t5q-btn" type="button" data-qback>Back</button>' +
          '<span class="pmq-t5q-spacer"></span>' +
          '<button class="pmq-btn pmq-t5q-btn" type="button" data-qcancel>Cancel</button>' +
          '<button class="pmq-btn pmq-btn-primary pmq-t5q-btn" type="button" data-qsubmit' + (api.valid() ? "" : " disabled") + ">Submit</button>" +
        "</div>";
      snip.textContent = "Review your answers";
    }

    function paintCap(idx, animate) {
      const text = "Q " + (idx + 1) + "/" + q.questions.length;
      if (text !== lastCount) {
        lastCount = text;
        if (animate) api.A.crossfadeNum(count, text);
        else count.textContent = text;
      }
      if (!reviewing) snip.textContent = trunc(q.questions[idx].prompt, QCAP_CHARS);
    }

    function setOpen(willOpen) {
      if (root.classList.contains("pmq-open") === willOpen) return;
      root.classList.toggle("pmq-open", willOpen);
      gw.classList.toggle("pmq-open", willOpen);
      cap.setAttribute("aria-expanded", String(willOpen));
      gridAnim(gw, willOpen ? "0fr" : "1fr", willOpen ? "1fr" : "0fr", 150, api.reduced());
    }

    function enterReview() {
      reviewing = true;
      paintReview();
      setOpen(true);
    }

    function exitReview() {
      reviewing = false;
      paintCap(lastIdx, false);
      paintBody(lastIdx);
    }

    function build(pillEl) {
      if (dead) return;
      if (pillEl && pillEl.parentNode) pillEl.parentNode.removeChild(pillEl);

      root = document.createElement("div");
      root.className = "pmq-t5q pmq-open";

      cap = document.createElement("button");
      cap.type = "button";
      cap.className = "pmq-t5q-cap";
      cap.setAttribute("aria-expanded", "true");
      count = document.createElement("span");
      count.className = "pmq-t5q-count";
      snip = document.createElement("span");
      snip.className = "pmq-t5q-snip";
      cap.appendChild(count);
      cap.appendChild(snip);

      gw = document.createElement("div");
      gw.className = "pmq-gw pmq-t5q-plate pmq-open";
      const gwi = document.createElement("div");
      gwi.className = "pmq-gwi";
      body = document.createElement("div");
      body.className = "pmq-t5q-body";
      gwi.appendChild(body);
      gw.appendChild(gwi);

      root.appendChild(cap);
      root.appendChild(gw);
      zoneEl.appendChild(root);

      cap.addEventListener("click", () => setOpen(!root.classList.contains("pmq-open")));

      root.addEventListener("click", e => {
        const rev = e.target.closest("[data-revto]");
        if (rev) { const to = +rev.dataset.revto; if (to === lastIdx) exitReview(); else api.gotoQuestion(to); return; }
        if (e.target.closest("[data-qback]")) { exitReview(); return; }
        const opt = e.target.closest("[data-opt]");
        if (opt) { api.select(q.questions[lastIdx], opt.dataset.opt); return; }
        if (e.target.closest("[data-qprev]")) { api.prev(); return; }
        if (e.target.closest("[data-qskip]")) { api.skip(); return; }
        if (e.target.closest("[data-qnext]")) { api.next(); return; }
        if (e.target.closest("[data-qcancel]")) { api.cancel(); return; }
        if (e.target.closest("[data-qreview]")) { enterReview(); return; }
        if (e.target.closest("[data-qsubmit]")) { if (api.valid()) api.submit(); return; }
      });

      root.addEventListener("input", e => {
        if (e.target.matches("[data-free]")) api.setFree(q.questions[lastIdx], e.target.value);
      });

      paintCap(lastIdx, false);
      paintBody(lastIdx);
      built = true;
      /* Auto-expand: the capsule row grows open in place to the ledger rows. */
      gridAnim(gw, "0fr", "1fr", 160, api.reduced());
    }

    /* Lifecycle (video 04): the shared "Preparing questions…" pill holds the
       zone first; the capsule expands in place after a short beat (the pill
       never paints under reduced motion — build resolves immediately). */
    const pill = api.preparePill();
    if (api.reduced()) build(pill);
    else timer = setTimeout(() => build(pill), 350);

    return {
      update(nextQ, idx) {
        if (!built) { lastIdx = idx; return; }
        if (idx !== lastIdx) {
          /* Any jump back onto a question (review back-links) exits review. */
          reviewing = false;
          lastIdx = idx;
          paintCap(idx, true);
          paintBody(idx);
          if (!api.reduced() && typeof body.animate === "function") {
            try { body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: GRID_EASE }); } catch (e) {}
          }
          setOpen(true);
          return;
        }
        if (reviewing) return;
        /* Same question: refresh state in place so the textarea keeps focus. */
        const question = nextQ.questions[idx];
        if (question.kind !== "freeform") {
          const ans = api.answer(question);
          root.querySelectorAll(".pmq-t5q-opt").forEach(opt => {
            const on = (ans.selected || []).includes(opt.dataset.opt);
            opt.classList.toggle("pmq-on", on);
            opt.setAttribute("aria-pressed", String(on));
          });
        } else {
          const ta = root.querySelector("[data-free]");
          const ans = api.answer(question);
          if (ta && document.activeElement !== ta && ta.value !== (ans.draft || "")) ta.value = ans.draft || "";
        }
        const reviewBtn = root.querySelector("[data-qreview]");
        if (reviewBtn) reviewBtn.disabled = !api.valid();
      },
      unmount() {
        dead = true;
        clearTimeout(timer);
        if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
        if (root && root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  /* ---- work: live-count chip strip with a single detail plate ---- */

  const GOAL_LABELS = { running: "Running", paused: "Paused", blocked: "Blocked", stopped: "Stopped", complete: "Complete" };

  function workChipHtml(domain, d, wapi) {
    if (domain === "goal") {
      const glyphKind = { running: "running", paused: "paused", blocked: "blocked", complete: "complete" }[d.goalStatus] || "ready";
      return '<span class="pmq-t5w-glyph">' + wapi.builders.stateGlyph(glyphKind) + "</span>" +
        '<span class="pmq-t5w-label">' + wapi.esc(d.goalPhase || GOAL_LABELS[d.goalStatus] || d.goalStatus) + "</span>";
    }
    if (domain === "todo") {
      return '<span class="pmq-t5w-label">tasks</span><span class="pmq-t5w-num" data-t5num="todo">' + d.todoDone + "/" + d.todoTotal + "</span>";
    }
    if (domain === "agents") {
      const sub = (d.queued || d.blocked) ? '<span class="pmq-t5w-sub">(+' + d.queued + "q/" + d.blocked + "b)</span>" : "";
      return '<span class="pmq-t5w-label">agents</span><span class="pmq-t5w-num" data-t5num="agents">' + d.agents + "</span>" + sub;
    }
    if (domain === "diff") {
      return '<span class="pmq-t5w-label">diff</span>' +
        '<span class="pmq-t5w-num pmq-t5w-diffnum"><span class="pmq-diff-add" data-t5num="adds">+' + d.diffAdds +
        '</span><span class="pmq-diff-del" data-t5num="dels">\u2212' + d.diffDels + "</span></span>";
    }
    return '<span class="pmq-t5w-label">alerts</span><span class="pmq-t5w-num" data-t5num="alerts">' + (d.approvals + d.warnings) + "</span>";
  }
  function workChipHtmlV3(domain, d, wapi) {
    if (domain === "ops") return '<span class="pmq-t5w-label">ops</span><span class="pmq-t5w-num" data-t5num="ops">' + d.ops + "</span>";
    if (domain === "bsd") return '<span class="pmq-t5w-label">bsd</span><span class="pmq-t5w-num" data-t5num="bsd">' + d.bsd + "</span>";
    if (domain === "attach") return '<span class="pmq-t5w-label">attach</span><span class="pmq-t5w-num" data-t5num="attach">' + d.attach + "</span>";
    if (domain === "artifacts") return '<span class="pmq-t5w-label">artifacts</span><span class="pmq-t5w-num" data-t5num="artifacts">' + wapi.store.threadArtifacts(wapi.store.activeKey()).length + "</span>";
    return "";
  }
  function workCardsFor(domain, key, wapi) {
    const b = wapi.builders;
    if (domain === "goal") { const c = b.goalCard(key); return c ? [c] : []; }
    if (domain === "todo") { const c = b.todoCard(key); return c ? [c] : []; }
    if (domain === "agents") return b.subagentCards(key);
    if (domain === "diff") return b.diffCards(key);
    if (domain === "alerts") {
      const cards = b.approvalCards(key);
      const grant = b.grantCard(key);
      if (grant) cards.push(grant);
      b.capacityCards(key).forEach(c => cards.push(c));
      return cards.concat(b.warningCards(key));
    }
    if (domain === "ops") return b.opsCards(key);
    if (domain === "bsd") return b.bsdCards(key);
    if (domain === "attach") return b.attachmentResolutionCards(key);
    if (domain === "artifacts") return b.artifactCards(key);
    return [];
  }

  function workRender(container, key, wapi) {
    const d = wapi.data;
    const defs = [];
    if (d.goalStatus) defs.push("goal");
    if (d.todoTotal) defs.push("todo");
    if (d.agents) defs.push("agents");
    if (d.diffFiles) defs.push("diff");
    if (d.approvals + d.warnings > 0) defs.push("alerts");
    if (d.ops > 0) defs.push("ops");
    if (d.bsd > 0) defs.push("bsd");
    if (d.attach > 0) defs.push("attach");
    if (wapi.store.threadArtifacts(key).length) defs.push("artifacts");
    if (!defs.length) return;
    if (workOpenDomain && defs.indexOf(workOpenDomain) < 0) workOpenDomain = null;

    const wrapEl = document.createElement("div");
    wrapEl.className = "pmq-t5work";

    const strip = document.createElement("div");
    strip.className = "pmq-t5w-chips";
    defs.forEach(domain => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "pmq-t5w-chip" + (workOpenDomain === domain ? " pmq-open" : "");
      chip.dataset.domain = domain;
      if (domain === "goal") chip.dataset.gst = d.goalStatus;
      chip.setAttribute("aria-expanded", String(workOpenDomain === domain));
      chip.innerHTML = ["goal", "todo", "agents", "diff", "alerts"].indexOf(domain) >= 0 ? workChipHtml(domain, d, wapi) : workChipHtmlV3(domain, d, wapi);
      strip.appendChild(chip);
    });
    window.PMIcons.hydrate(strip);
    wrapEl.appendChild(strip);

    /* LIVE counts: crossfade the numeral when a tracked value changes. */
    const cross = (sel, track, val, text) => {
      const cell = strip.querySelector('[data-t5num="' + sel + '"]');
      if (cell && wapi.numChanged(track + ":" + key, val)) wapi.A.crossfadeNum(cell, text);
    };
    cross("todo", "t5w-todo", d.todoDone, d.todoDone + "/" + d.todoTotal);
    cross("agents", "t5w-agents", d.agents, String(d.agents));
    cross("adds", "t5w-adds", d.diffAdds, "+" + d.diffAdds);
    cross("dels", "t5w-dels", d.diffDels, "\u2212" + d.diffDels);
    cross("alerts", "t5w-alerts", d.approvals + d.warnings, String(d.approvals + d.warnings));
    const goalChip = strip.querySelector('[data-domain="goal"]');
    if (goalChip && wapi.numChanged("t5w-goal:" + key, d.goalStatus)) wapi.A.pop(goalChip);

    /* Single-detail plate: only the open domain's builder card is rendered,
       wrapped in a grid-rows wrapper sidded t5-<domain> so the kit surface
       animation can find and drive it across the per-tick rebuild. */
    if (workOpenDomain) {
      const cards = workCardsFor(workOpenDomain, key, wapi);
      if (cards.length) {
        const gw = document.createElement("div");
        gw.className = "pmq-gw pmq-t5w-detail pmq-open";
        gw.dataset.sid = "t5-" + workOpenDomain;
        const gwi = document.createElement("div");
        gwi.className = "pmq-gwi";
        const holder = document.createElement("div");
        holder.className = "pmq-t5w-card";
        cards.forEach(c => holder.appendChild(c));
        gwi.appendChild(holder);
        gw.appendChild(gwi);
        wrapEl.appendChild(gw);
      } else {
        workOpenDomain = null;
      }
    }

    strip.addEventListener("click", e => {
      const chip = e.target.closest("[data-domain]");
      if (!chip) return;
      const domain = chip.dataset.domain;
      if (workOpenDomain === domain) {
        wapi.toggleSurface("t5-" + domain, () => {
          workOpenDomain = null;
          wapi.store.mutate(() => {});
        });
        return;
      }
      /* Opening one chip collapses the open one first, then expands the new
         domain — both phases driven through the kit surface animation. */
      const openNew = () => wapi.toggleSurface("t5-" + domain, () => {
        workOpenDomain = domain;
        wapi.store.mutate(() => {});
      });
      if (workOpenDomain) wapi.toggleSurface("t5-" + workOpenDomain, openNew);
      else openNew();
    });

    container.appendChild(wrapEl);
  }

  function mount(slotEl, ctx) {
    return window.PMChatThreadKit.mount(slotEl, ctx, {
      structure: "condenser",
      rootClass: "pmq-t5",
      enterMsg,
      groupSameRole: true,
      surfacesStyle: "chips",
      messageClass: () => "pmq-t5-msg",
      questRenderer,
      workRender,
      decorate(el, msg, api) {
        const inner = el.querySelector(".pmq-msg-inner");
        const body = inner.querySelector(".pmq-body");
        if (!body) return;

        const prev = api.prevMsg;
        const sameRun = prev && prev.role === "assistant" && msg.role === "assistant" &&
          personaOf(prev) === personaOf(msg);
        const flat = String(msg.body || "").replace(/\s+/g, " ").trim();

        /* Short assistant turns and every user turn keep the inline who-tag. */
        if (msg.role === "user" || flat.length <= CONDENSE_AT) {
          const who = document.createElement("b");
          who.className = "pmq-t5-who";
          if (msg.role === "user") {
            who.textContent = "You";
          } else {
            if (sameRun) return;
            who.textContent = personaOf(msg) || "Assistant";
          }
          (body.querySelector("p") || body).prepend(who);
          return;
        }

        /* Long assistant turns condense to a single ledger line —
           [who · snippet · chevron] — that expands the full block in place,
           keeping the run's rhythm uniform with the user rows. */
        const st = api.store.thread(api.store.activeKey());
        const key = "t5:" + msg.id;
        const open = !!(st && st.expandedByIds && st.expandedByIds[key] === true);

        const gw = document.createElement("div");
        gw.className = "pmq-gw pmq-t5-plate" + (open ? " pmq-open" : "");
        const gwi = document.createElement("div");
        gwi.className = "pmq-gwi";
        ["pmq-body", "pmq-thoughts", "pmq-agroup", "pmq-cquest"].forEach(cls => {
          const node = inner.querySelector(":scope > ." + cls);
          if (node) gwi.appendChild(node);
        });
        gw.appendChild(gwi);
        if (!gwi.childElementCount) return;

        el.classList.add("pmq-t5-condensed");
        el.classList.toggle("pmq-t5-open", open);

        const row = document.createElement("button");
        row.type = "button";
        row.className = "pmq-t5-cond";
        row.setAttribute("aria-expanded", String(open));
        if (!sameRun) {
          const who = document.createElement("b");
          who.className = "pmq-t5-who";
          who.textContent = personaOf(msg) || "Assistant";
          row.appendChild(who);
        }
        const snip = document.createElement("span");
        snip.className = "pmq-t5-snip";
        snip.textContent = flatSnippet(msg.body);
        row.appendChild(snip);

        /* Silent state write + class toggle (no store emit) so the per-tick
           rebuild never recreates the wrapper mid-transition. */
        row.addEventListener("click", e => {
          e.stopPropagation();
          const s = api.store.thread(api.store.activeKey());
          const willOpen = !el.classList.contains("pmq-t5-open");
          if (s && s.expandedByIds) s.expandedByIds[key] = willOpen;
          el.classList.toggle("pmq-t5-open", willOpen);
          gw.classList.toggle("pmq-open", willOpen);
          row.setAttribute("aria-expanded", String(willOpen));
        });

        inner.prepend(row);
        const hover = inner.querySelector(":scope > .pmq-msg-hover");
        inner.insertBefore(gw, hover || null);
      }
    });
  }

  window.PMChatThreads[ID] = { id: ID, label: window.PMChatRegistry.threadLabel(ID), mount };
})();
