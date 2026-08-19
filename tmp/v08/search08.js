(async () => {
  const cases = [{"query": "openai api key", "result_id": "r_f856cec318d91697", "expected": {"domain": "ai", "page": "accounts", "manager": null, "object": null, "section": "accounts", "row": "ai.accounts.openai-api-key"}}, {"query": "openai api key", "result_id": "r_51b49747eae5c2a3", "expected": {"domain": "ai", "page": null, "manager": "providers", "object": "openai", "section": "overview", "row": null}}, {"query": "theem", "result_id": "r_0fb731e11753ac25", "expected": {"domain": "general", "page": "visual", "manager": null, "object": null, "section": "visual", "row": "general.visual.theme"}}, {"query": "rate limit", "result_id": "r_ccd4d91a6b4dc100", "expected": {"domain": "ai", "page": "accounts", "manager": null, "object": null, "section": "accounts", "row": "ai.accounts.cooldown-policy"}}, {"query": "rate limit", "result_id": "r_6bfe03cb909de537", "expected": {"domain": "ai", "page": "rate-limits", "manager": "providers", "object": null, "section": null, "row": null}}, {"query": "copy settings", "result_id": "r_8b0c67409da5d3a8", "expected": {"domain": "system", "page": "copy", "manager": "lifecycle", "object": null, "section": "copy", "row": null}}, {"query": "copy settings", "result_id": "r_773d3ba5904888a1", "expected": {"domain": "system", "page": null, "manager": "lifecycle", "object": null, "section": "help", "row": null}}, {"query": "doctor", "result_id": "r_f4803ff143073acd", "expected": {"domain": "system", "page": null, "manager": "doctor", "object": null, "section": null, "row": null}}, {"query": "install claude", "result_id": "r_1b23d491f0558d39", "expected": {"domain": "system", "page": "advanced", "manager": null, "object": null, "section": "advanced", "row": "system.advanced.cli-path-claude"}}, {"query": "theme", "result_id": "r_0fb731e11753ac25", "expected": {"domain": "general", "page": "visual", "manager": null, "object": null, "section": "visual", "row": "general.visual.theme"}}, {"query": "memory retention", "result_id": "r_5a0b8b4fda639a03", "expected": {"domain": "memory", "page": "retention", "manager": "memory", "object": null, "section": null, "row": null}}, {"query": "worktree", "result_id": "r_0c414eed895de3f1", "expected": {"domain": "branching", "page": null, "manager": "source-control", "object": null, "section": null, "row": null}}, {"query": "shortcut", "result_id": "r_4820b11e43a4d7e6", "expected": {"domain": "extensions", "page": "commands", "manager": null, "object": null, "section": "commands", "row": "extensions.commands.shortcut-hints"}}, {"query": "theem", "result_id": null, "expected": null}];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const input = document.getElementById('pmv2-search');
  const results = document.getElementById('pmv2-results');
  const NL = String.fromCharCode(10);
  const out = [];
  const all = attr => [...document.querySelectorAll('[' + attr + ']')].map(e => e.getAttribute(attr));
  const visInStage = el => { if (!el) return false; const r = el.getBoundingClientRect(); const st = document.querySelector('.pmx-stage').getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > st.top && r.top < st.bottom; };
  for (const c of cases) {
    const rec = { query: c.query, result_id: c.result_id };
    try {
      input.focus();
      input.value = c.query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      let row = null;
      for (let i = 0; i < 80; i++) {
        await sleep(50);
        if (!results.hidden) {
          row = c.result_id ? results.querySelector('[data-result-id="' + c.result_id + '"]') : null;
          if (row || results.querySelector('.dt3-hit-empty') || results.querySelector('[data-result-id]')) break;
        }
      }
      const clickId = c.result_id || 'r_0fb731e11753ac25';
      row = results.hidden ? null : results.querySelector('[data-result-id="' + clickId + '"]');
      if (!row) { rec.pass = false; rec.note = results.querySelector('.dt3-hit-empty') ? 'result not rendered (empty state)' : 'result not rendered'; out.push(rec); continue; }
      row.click();
      await sleep(700);
      const root = document.querySelector('[data-view]');
      const e = c.expected || {};
      const rowEl = e.row ? document.querySelector('[data-setting-id="' + e.row + '"]') : null;
      const located = document.querySelector('.pmv2-locate, .dt3-located');
      const crumbEl = document.querySelector('.dt3-crumb');
      rec.actual = {
        view: root ? root.getAttribute('data-view') : null,
        domains: all('data-domain-id'),
        managers: all('data-manager-id'),
        objects: all('data-object-id'),
        sections: all('data-section-id'),
        rowPresent: !!rowEl,
        rowVisible: visInStage(rowEl),
        crumb: crumbEl ? crumbEl.innerText.split(NL).join(' / ') : null
      };
      rec.focus_highlight = located ? 'pass' : 'fail';
      rec.locatedTarget = located ? { setting: located.getAttribute('data-setting-id'), manager: located.getAttribute('data-manager-id'), object: located.getAttribute('data-object-id'), section: located.getAttribute('data-section-id') } : null;
      rec.activeTag = document.activeElement ? document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0, 40) : null;
      const checks = [];
      if (e.domain) checks.push(rec.actual.domains.includes(e.domain));
      if (e.manager) checks.push(rec.actual.managers.includes(e.manager));
      if (e.object) checks.push(rec.actual.objects.includes(e.object));
      if (e.section) checks.push(rec.actual.sections.includes(e.section));
      if (e.row) checks.push(rec.actual.rowVisible);
      rec.destPass = checks.every(Boolean);
      const backBtn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().indexOf('Back') === 0);
      if (!backBtn) { rec.back_restores = 'fail'; rec.backNote = 'no back button'; }
      else {
        backBtn.click();
        await sleep(700);
        const valOk = input.value === c.query;
        rec.backValue = input.value;
        if (!c.result_id) {
          const sel = results.querySelector('[data-result-id="' + clickId + '"]');
          rec.backDetail = { valOk: valOk, selected: sel ? sel.getAttribute('aria-selected') : null, open: !results.hidden };
          rec.back_restores = (valOk && sel && sel.getAttribute('aria-selected') === 'true' && !results.hidden) ? 'pass' : 'fail';
        } else {
          rec.back_restores = valOk ? 'pass' : 'fail';
        }
      }
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(150);
      rec.pass = !!(rec.destPass && rec.focus_highlight === 'pass' && rec.back_restores === 'pass');
    } catch (err) { rec.pass = false; rec.note = String(err); }
    out.push(rec);
  }
  return out;
})