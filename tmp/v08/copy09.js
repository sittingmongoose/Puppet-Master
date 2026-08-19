(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const stage = document.querySelector('.pmx-stage');
  const out = { steps: [] };
  const q = sel => document.querySelector(sel);
  const qa = sel => [...document.querySelectorAll(sel)];
  const btn = (ct) => qa('[data-ct="' + ct + '"]')[0];
  // home then open copy
  const home = document.querySelector('[data-ct="nav-home"]');
  if (home) home.click();
  await sleep(300);
  const copyTab = document.querySelector('[data-ct="nav-copy"]');
  if (!copyTab) return { fail: 'no nav-copy' };
  copyTab.click();
  await sleep(400);
  out.opened = /Copy Settings/.test(stage.innerText);
  const src = q('.ct-src[data-ct="copy-src"]');
  if (!src) return { ...out, fail: 'no sources' };
  out.source = src.getAttribute('data-arg');
  src.click();
  await sleep(250);
  const cont = btn('copy-to-cats');
  if (!cont || cont.disabled) return { ...out, fail: 'continue disabled' };
  cont.click();
  await sleep(350);
  // step 2: keep exactly 2
  let cats = qa('.ct-cat[data-ct="copy-cat"]');
  out.catCount = cats.length;
  let onCats = cats.filter(c => c.getAttribute('aria-checked') === 'true');
  // if none selected by default, select first two
  if (!onCats.length) { cats[0].click(); await sleep(200); cats = qa('.ct-cat[data-ct="copy-cat"]'); cats[1].click(); await sleep(200); }
  else {
    for (let i = 2; i < onCats.length; i++) { onCats[i].click(); await sleep(200); }
  }
  out.picked = qa('.ct-cat[data-ct="copy-cat"]').filter(c => c.getAttribute('aria-checked') === 'true').map(c => c.getAttribute('data-arg'));
  const rev = btn('copy-to-review');
  if (!rev || rev.disabled) return { ...out, fail: 'review disabled' };
  rev.click();
  await sleep(400);
  out.totals = qa('.ct-total').map(t => t.innerText.split(String.fromCharCode(10)).join(' '));
  const apply = btn('copy-apply');
  if (!apply || apply.disabled) return { ...out, fail: 'apply disabled' };
  apply.click();
  let done = false, txt = '';
  for (let i = 0; i < 70; i++) { await sleep(300); txt = stage.innerText; if (/Copy complete|ended as|failed/i.test(txt)) { done = true; break; } }
  out.applied = done;
  out.hasRestoreRef = /Restore point/i.test(txt);
  out.receiptShown = /Copy complete/i.test(txt);
  const rb = btn('copy-rollback');
  if (!rb) return { ...out, fail: 'no rollback' };
  rb.click();
  await sleep(1200);
  const after = stage.innerText;
  out.rollbackOp = /rollback|rolled back|restored/i.test(after);
  out.afterSample = after.replace(/\s+/g, ' ').slice(0, 220);
  out.pass = !!(done && out.hasRestoreRef && out.receiptShown && out.picked.length === 2 && out.rollbackOp);
  return out;
})