import { launch } from './drive.mjs';
const { browser, page, errs } = await launch({ theme: 'friendly-dark', width: 1500, height: 940 });
const click = async (sel, ms=700) => { const ok = await page.evaluate(s=>{const e=document.querySelector(s); if(!e||e.disabled) return false; e.click(); return true;}, sel); if(!ok) console.log(' ! fail', sel); await page.waitForTimeout(ms); return ok; };
const primary = () => click('#pmo .pmo-foot-actions .pmo-btn--primary');
await page.evaluate(() => window.PMO_ONBOARDING.open('fail'));
await page.waitForTimeout(800);
await primary();
await click('#pmo [data-pmo-act="where"][data-arg="existing-device"]');
await primary();                                        // pair
await click('#pmo [data-pmo-act="pick-device"][data-arg="attic"]');
await primary();                                        // device-ready
await click('#pmo [data-pmo-act="from-ready"][data-arg="new"]');  // project
await page.fill('#pmo-name', 'Book club website'); await page.waitForTimeout(400);
await primary();                                        // inherit
await primary();                                        // review
console.log('at review:', await page.evaluate(()=>window.PMO_ONBOARDING.screen));
await primary();                                        // commit
await page.waitForTimeout(3600);
await page.screenshot({ path: 'evidence/fail_01_failed.png' });
console.log('after attempt 1:', JSON.stringify(await page.evaluate(() => {
  const r = window.PMO_FLOW.draft.receipt;
  return { committed: window.PMO_FLOW.draft.committed, status: r&&r.status, failure: r&&r.failure&&r.failure.reason, key: r&&r.idempotency_key };
})));
await click('#pmo [data-pmo-act="retry-commit"]', 4200);
await page.screenshot({ path: 'evidence/fail_02_retried.png' });
console.log('after retry:  ', JSON.stringify(await page.evaluate(() => {
  const r = window.PMO_FLOW.draft.receipt;
  return { committed: window.PMO_FLOW.draft.committed, status: r&&r.status, key: r&&r.idempotency_key, attempts: window.PMO_FLOW.draft.commitAttempts };
})));
console.log('ERRS:', errs.slice(0,4));
await browser.close();
