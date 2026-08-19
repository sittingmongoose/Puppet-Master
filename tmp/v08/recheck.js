(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const input = document.getElementById('pmv2-search');
  const results = document.getElementById('pmv2-results');
  const NL = String.fromCharCode(10);
  const out = [];
  const queries = [
    { q: 'rate limit', id: 'r_6bfe03cb909de537' },
    { q: 'copy settings', id: 'r_8b0c67409da5d3a8' },
    { q: 'copy settings', id: 'r_773d3ba5904888a1' },
    { q: 'memory retention', id: 'r_5a0b8b4fda639a03' },
    { q: 'worktree', id: 'r_0c414eed895de3f1' },
    { q: 'doctor', id: 'r_f4803ff143073acd' }
  ];
  for (const c of queries) {
    input.value = c.q;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    let row = null;
    for (let i = 0; i < 80; i++) { await sleep(50); if (!results.hidden) { row = results.querySelector('[data-result-id="' + c.id + '"]'); if (row) break; } }
    if (!row) { out.push({ id: c.id, fail: 'not rendered' }); continue; }
    row.click();
    await sleep(800);
    const tabs = [...document.querySelectorAll('.dt3-mgr-head ~ * [aria-selected], .dt3-tab, [role="tab"]')].map(t => ({ cls: t.className, sel: t.getAttribute('aria-selected'), txt: t.textContent.trim().slice(0, 24) }));
    const tabStrip = document.querySelector('.dt3-tabs, [role="tablist"]');
    const stripHTML = tabStrip ? tabStrip.outerHTML.slice(0, 600) : null;
    const active = [...document.querySelectorAll('[aria-selected="true"], [aria-current], .dt3-tab.on, .pm-tab[aria-selected="true"]')].map(t => t.textContent.trim().slice(0, 30));
    const crumb = document.querySelector('.dt3-crumb') ? document.querySelector('.dt3-crumb').innerText.split(NL).filter(Boolean).join(' / ') : null;
    const stageHead = document.querySelector('.pmx-stage h1, .pmx-stage h2');
    out.push({ id: c.id, crumb: crumb, active: active, h: stageHead ? stageHead.textContent.trim() : null, strip: stripHTML });
    const backBtn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().indexOf('Back') === 0);
    if (backBtn) { backBtn.click(); await sleep(400); }
    input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(150);
  }
  return out;
})
