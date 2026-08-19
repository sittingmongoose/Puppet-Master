(async () => {
  const routes = __ROUTES__;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const NL = String.fromCharCode(10);
  const baseUrl = location.href;
  const out = [];
  const goHome = async () => {
    const home = [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Home');
    if (home) home.click();
    await sleep(250);
  };
  for (const rt of routes) {
    const m = rt.match(/^#\/([^/]+)\/([^/]+)$/);
    const rec = { route: rt };
    if (!m) { rec.pass = false; rec.note = 'bad route'; out.push(rec); continue; }
    const domain = m[1], mgr = m[2];
    try {
      await goHome();
      const card = document.querySelector('[data-domain-id="' + domain + '"]');
      if (!card) { rec.pass = false; rec.note = 'no domain card ' + domain; out.push(rec); continue; }
      card.click();
      await sleep(350);
      let row = document.querySelector('[data-manager-id="' + mgr + '"]');
      let deferred = false;
      if (!row && mgr.indexOf('owner-') === 0) { row = document.querySelector('[data-manager-id="deferred-' + mgr.slice(6) + '"]'); deferred = true; }
      if (!row) { rec.pass = false; rec.note = 'no manager row ' + mgr; out.push(rec); continue; }
      row.click();
      await sleep(500);
      const stage = document.querySelector('.pmx-stage');
      const crumbEl = document.querySelector('.dt3-crumb');
      const backBtn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().indexOf('Back') === 0);
      const search = document.getElementById('pmv2-search');
      const head = document.querySelector('.dt3-mgr-head, .dt3-owner');
      rec.urlSame = location.href === baseUrl;
      rec.iframes = document.querySelectorAll('iframe').length;
      rec.shell = !!(backBtn && crumbEl && search);
      rec.headId = head ? head.getAttribute('data-manager-id') : null;
      rec.textLen = stage.innerText.trim().length;
      rec.crumb = crumbEl ? crumbEl.innerText.split(NL).filter(Boolean).join(' / ') : null;
      rec.deferred = deferred;
      rec.contentOk = rec.textLen > 80 && !!head;
      rec.pass = !!(rec.urlSame && rec.iframes === 0 && rec.shell && rec.contentOk);
    } catch (err) { rec.pass = false; rec.note = String(err); }
    out.push(rec);
  }
  await goHome();
  return out;
})
