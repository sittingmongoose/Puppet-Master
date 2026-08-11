/* Passive spellcheck: native underline in the textarea plus a quiet
   context-menu / keyboard suggestion surface. No toolbar button, no
   autocorrect, no provider call. Skips code, paths, commands, URLs, hashes,
   identifiers, structured data and known model/provider/persona/tool names. */
window.PMChatSpell = (() => {
  const MISSPELLINGS = {
    recieve: "receive",
    seperate: "separate",
    definately: "definitely",
    accomodate: "accommodate",
    occured: "occurred",
    teh: "the",
    wich: "which",
    persistant: "persistent",
    compatability: "compatibility",
    renderes: "renders"
  };
  const KNOWN = ["puppet", "master", "figma", "aurora", "slint", "qwen", "kimi", "opus", "anthropic", "moonshot", "alibaba", "openai", "persona", "orchestrator", "worktree", "subagent", "subagents", "docker", "mermaid", "tastebook", "pmconcept7", "plans", "canonical", "fileSafe"];

  function skipToken(word) {
    const w = word.toLowerCase();
    if (!w) return true;
    if (/[^a-z]/.test(w) && !/^[a-z]+$/i.test(word)) return true;
    if (KNOWN.includes(w)) return true;
    return false;
  }

  function flaggedAt(ta, env) {
    const key = env.store.activeKey();
    const s = env.store.thread(key);
    const text = ta.value;
    let pos = ta.selectionStart != null ? ta.selectionStart : 0;
    const before = text.slice(0, pos);
    const m = before.match(/[A-Za-z]+$/);
    const after = text.slice(pos).match(/^[A-Za-z]+/);
    const word = (m ? m[0] : "") + (after ? after[0] : "");
    if (!word || skipToken(word)) return null;
    const lw = word.toLowerCase();
    if (s.spellIgnoredDraft.includes(lw)) return null;
    if (env.store.state.session.spellPersonal.map(x => x.toLowerCase()).includes(lw)) return null;
    if (env.store.state.session.spellProject.map(x => x.toLowerCase()).includes(lw)) return null;
    if (!MISSPELLINGS[lw]) return null;
    const start = pos - (m ? m[0].length : 0);
    return { word, lower: lw, start, end: start + word.length, suggestion: MISSPELLINGS[lw] };
  }

  function countFlagged(ta, env) {
    const key = env.store.activeKey();
    const s = env.store.thread(key);
    let n = 0;
    const re = /[A-Za-z]+/g;
    let m2;
    while ((m2 = re.exec(ta.value))) {
      const lw = m2[0].toLowerCase();
      if (skipToken(m2[0]) || !MISSPELLINGS[lw]) continue;
      if (s.spellIgnoredDraft.includes(lw)) continue;
      n++;
    }
    return n;
  }

  function attach(ta, env, hintEl) {
    ta.setAttribute("autocorrect", "off");
    ta.setAttribute("autocapitalize", "off");

    function refreshHint() {
      if (!hintEl) return;
      const s = env.store.thread(env.store.activeKey());
      if (s.spellDisabled) { ta.setAttribute("spellcheck", "false"); hintEl.hidden = true; return; }
      ta.setAttribute("spellcheck", "true");
      const n = countFlagged(ta, env);
      hintEl.hidden = n === 0;
      if (n > 0) hintEl.textContent = n + " underlined word" + (n > 1 ? "s" : "") + " · right-click for suggestions";
    }

    ta.addEventListener("input", refreshHint);
    ta.addEventListener("keyup", refreshHint);
    env.store.subscribe(refreshHint);
    refreshHint();

    ta.addEventListener("contextmenu", e => {
      const s = env.store.thread(env.store.activeKey());
      if (s.spellDisabled) return;
      const hit = flaggedAt(ta, env);
      if (!hit) return;
      e.preventDefault();
      openMenu(ta, env, hit, e.target);
    });

    ta.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === ";") {
        const s = env.store.thread(env.store.activeKey());
        if (s.spellDisabled) return;
        const hit = flaggedAt(ta, env);
        if (hit) { e.preventDefault(); openMenu(ta, env, hit, ta); }
      }
    });
  }

  function openMenu(ta, env, hit, anchor) {
    const items = [
      { label: "Replace with “" + hit.suggestion + "”", icon: "edit", onpick: () => {
          const v = ta.value;
          ta.value = v.slice(0, hit.start) + hit.suggestion + v.slice(hit.end);
          ta.dispatchEvent(new Event("input", { bubbles: true }));
        } },
      { label: "Ignore once", icon: "close", onpick: () => {} },
      { label: "Ignore for this draft", icon: "history", onpick: () => env.store.spellIgnoreDraft(env.store.activeKey(), hit.lower) },
      { sep: true },
      { label: "Add to personal dictionary", icon: "plus", onpick: () => env.store.spellAdd(hit.lower, "personal") },
      { label: "Add to project dictionary", icon: "folder", onpick: () => env.store.spellAdd(hit.lower, "project") }
    ];
    env.popups.menu(anchor, items, { title: "Spelling · " + hit.word, width: 260 });
  }

  return { attach, flaggedAt, countFlagged };
})();
