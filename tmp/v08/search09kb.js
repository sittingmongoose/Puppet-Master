(async () => {
  const cases = [{"query": "openai api key", "result_id": "r_f856cec318d91697", "expected": {"domain": "ai", "page": "accounts", "manager": null, "object": null, "section": "accounts", "row": "ai.accounts.openai-api-key"}}, {"query": "openai api key", "result_id": "r_51b49747eae5c2a3", "expected": {"domain": "ai", "page": null, "manager": "providers", "object": "openai", "section": "overview", "row": null}}, {"query": "theem", "result_id": "r_0fb731e11753ac25", "expected": {"domain": "general", "page": "visual", "manager": null, "object": null, "section": "visual", "row": "general.visual.theme"}}, {"query": "rate limit", "result_id": "r_ccd4d91a6b4dc100", "expected": {"domain": "ai", "page": "accounts", "manager": null, "object": null, "section": "accounts", "row": "ai.accounts.cooldown-policy"}}, {"query": "rate limit", "result_id": "r_6bfe03cb909de537", "expected": {"domain": "ai", "page": "rate-limits", "manager": "providers", "object": null, "section": null, "row": null}}, {"query": "copy settings", "result_id": "r_8b0c67409da5d3a8", "expected": {"domain": "system", "page": "copy", "manager": "lifecycle", "object": null, "section": "copy", "row": null}}, {"query": "copy settings", "result_id": "r_773d3ba5904888a1", "expected": {"domain": "system", "page": null, "manager": "lifecycle", "object": null, "section": "help", "row": null}}, {"query": "doctor", "result_id": "r_f4803ff143073acd", "expected": {"domain": "system", "page": null, "manager": "doctor", "object": null, "section": null, "row": null}}, {"query": "install claude", "result_id": "r_1b23d491f0558d39", "expected": {"domain": "system", "page": "advanced", "manager": null, "object": null, "section": "advanced", "row": "system.advanced.cli-path-claude"}}, {"query": "theme", "result_id": "r_0fb731e11753ac25", "expected": {"domain": "general", "page": "visual", "manager": null, "object": null, "section": "visual", "row": "general.visual.theme"}}, {"query": "memory retention", "result_id": "r_5a0b8b4fda639a03", "expected": {"domain": "memory", "page": "retention", "manager": "memory", "object": null, "section": null, "row": null}}, {"query": "worktree", "result_id": "r_0c414eed895de3f1", "expected": {"domain": "branching", "page": null, "manager": "source-control", "object": null, "section": null, "row": null}}, {"query": "shortcut", "result_id": "r_4820b11e43a4d7e6", "expected": {"domain": "extensions", "page": "commands", "manager": null, "object": null, "section": "commands", "row": "extensions.commands.shortcut-hints"}}, {"query": "theem", "result_id": null, "expected": null}];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const input = document.getElementById('pmv2-search');
  const results = document.getElementById('pmv2-results');
  const NL = String.fromCharCode(10);
  const out = [];
  const all = attr => [...document.querySelectorAll('.pmx-stage [' + attr + ']')].map(e => e.getAttribute(attr));
  for (const c of cases) {
    const rec = { query: c.query, result_id: c.result_id };
    try {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(150);
      input.focus();
      input.value = c.query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      let row = null;
      for (let i = 0; i < 80; i++) { await sleep(50); if (!results.hidden) { row = results.querySelector('[data-result-id="' + (c.result_id || 'r_0fb731e11753ac25') + '"]'); if (row || results.querySelector('.ct-results-empty')) break; } }
      if (!row) { rec.kb = { fail: 'result not rendered' }; out.push(rec); continue; }
      row.setAttribute('data-active', 'true');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await sleep(900);
      const crumbEl = document.querySelector('.ct-crumbs');
      const located = document.querySelector('.pmx-stage .pmv2-locate');
      const e = c.expected || {};
      const rowEl = e.row ? document.querySelector('[data-setting-id="' + e.row + '"]') : null;
      const st = document.querySelector('.pmx-stage').getBoundingClientRect();
      let rowVisible = false;
      if (rowEl) { const rr = rowEl.getBoundingClientRect(); rowVisible = rr.width > 0 && rr.height > 0 && rr.bottom > st.top && rr.top < st.bottom; }
      rec.kb = {
        crumb: crumbEl ? crumbEl.innerText.split(NL).filter(Boolean).join(' / ') : null,
        managers: all('data-manager-id'),
        objects: all('data-object-id'),
        sections: all('data-section-id'),
        rowPresent: !!rowEl,
        rowVisible: rowVisible,
        located: located ? { cls: String(located.className).slice(0,60), setting: located.getAttribute('data-setting-id'), manager: located.getAttribute('data-manager-id'), object: located.getAttribute('data-object-id'), section: located.getAttribute('data-section-id'), domain: located.getAttribute('data-domain-id') } : null
      };
      // back
      const backBtn = document.querySelector('[data-ct="back"]');
      backBtn.click();
      await sleep(900);
      const selRow = results.hidden ? null : results.querySelector('[data-result-id="' + (c.result_id || 'r_0fb731e11753ac25') + '"]');
      rec.kb.back = { value: input.value, valOk: input.value === c.query, open: !results.hidden, selActive: selRow ? selRow.getAttribute('data-active') : null };
    } catch (err) { rec.kb = { fail: String(err) }; }
    out.push(rec);
  }
  return out;
})
