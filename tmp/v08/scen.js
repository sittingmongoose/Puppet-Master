(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const stage = document.querySelector('.pmx-stage');
  const out = { scenarios: {} };
  const home = [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Home');
  if (home) home.click();
  await sleep(300);
  // open drawer
  document.querySelector('[data-demo-open]').click();
  await sleep(300);
  const names = [...document.querySelectorAll('.dt3-demo-btn[data-scenario]')].map(b => b.getAttribute('data-scenario'));
  out.available = names;
  for (const sc of ['offline', 'managed', 'loading-cached']) {
    const btn = document.querySelector('.dt3-demo-btn[data-scenario="' + sc + '"]');
    if (!btn) { out.scenarios[sc] = { pass: false, note: 'scenario button missing' }; continue; }
    btn.click();
    await sleep(500);
    const banner = document.querySelector('.dt3-scenario-banner');
    out.scenarios[sc] = {
      banner: banner ? banner.innerText.replace(/\s+/g, ' ').slice(0, 220) : null,
      dataScenario: banner ? banner.getAttribute('data-scenario') : null,
      homeTextSample: stage.innerText.replace(/\s+/g, ' ').slice(0, 300),
      pass: !!banner && banner.getAttribute('data-scenario') === sc
    };
    // reopen drawer for next selection
    if (sc !== 'loading-cached') { document.querySelector('[data-demo-open]').click(); await sleep(300); }
  }
  // clear via banner button
  const clearBtn = document.querySelector('.dt3-scenario-banner button');
  if (clearBtn) { clearBtn.click(); await sleep(400); }
  out.cleared = !document.querySelector('.dt3-scenario-banner');
  out.afterClear = stage.innerText.replace(/\s+/g, ' ').slice(0, 150);
  out.pass = ['offline','managed','loading-cached'].every(s => out.scenarios[s] && out.scenarios[s].pass) && out.cleared;
  return out;
})
