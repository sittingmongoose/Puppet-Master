(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const out = { steps: [] };
  const stage = document.querySelector('.pmx-stage');
  // go home then open Copy Settings from rail
  const home = [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Home');
  if (home) home.click();
  await sleep(300);
  const util = [...document.querySelectorAll('button, a')].find(b => b.textContent.trim() === 'Copy Settings');
  if (!util) return { fail: 'no Copy Settings utility' };
  util.click();
  await sleep(400);
  out.steps.push({ step: 'open', h: (stage.querySelector('h1') || {}).textContent || null });
  // step 1: pick first source
  const src = document.querySelector('.dt3-src[data-source-id]');
  if (!src) return { ...out, fail: 'no sources' };
  out.source = src.getAttribute('data-source-id');
  src.click();
  await sleep(400);
  // step 2: keep exactly 2 categories
  const cats = [...document.querySelectorAll('.dt3-cat[data-category-id]')];
  out.catCount = cats.length;
  for (let i = 2; i < cats.length; i++) { if (cats[i].getAttribute('aria-pressed') === 'true') cats[i].click(); }
  await sleep(100);
  out.picked = [...document.querySelectorAll('.dt3-cat[aria-pressed="true"]')].map(c => c.getAttribute('data-category-id'));
  const review = [...document.querySelectorAll('button')].find(b => /^Review /.test(b.textContent.trim()));
  if (!review) return { ...out, fail: 'no review button' };
  out.reviewLabel = review.textContent.trim();
  review.click();
  await sleep(400);
  // step 3: totals
  const totals = [...document.querySelectorAll('.dt3-total')].map(t => t.innerText.split(String.fromCharCode(10)).join(' '));
  out.totals = totals;
  const apply = [...document.querySelectorAll('button')].find(b => /^Apply /.test(b.textContent.trim()));
  if (!apply) return { ...out, fail: 'no apply button' };
  out.applyLabel = apply.textContent.trim();
  apply.click();
  // step 4: wait for op done
  let done = false, receiptText = '';
  for (let i = 0; i < 60; i++) {
    await sleep(300);
    receiptText = stage.innerText;
    if (/Applied and verified|ended as/.test(receiptText)) { done = true; break; }
  }
  out.applied = done;
  out.hasRestoreRef = /restore point/i.test(receiptText);
  out.receiptShown = /Receipt/.test(receiptText);
  const rb = [...document.querySelectorAll('button')].find(b => /Roll back this copy/.test(b.textContent));
  if (!rb) return { ...out, fail: 'no rollback button' };
  rb.click();
  await sleep(500);
  out.afterRollback = stage.innerText.slice(0, 200);
  const toast = document.querySelector('.dt3-toast-stack') ? document.querySelector('.dt3-toast-stack').innerText : null;
  out.toast = toast;
  out.pass = !!(done && out.hasRestoreRef && out.receiptShown && out.picked.length === 2 && /Rolled back/i.test(toast || '') || /restore point/i.test(out.afterRollback));
  return out;
})
