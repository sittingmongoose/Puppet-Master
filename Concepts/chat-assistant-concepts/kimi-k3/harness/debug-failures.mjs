/* Focused diagnosis of packet-probe failures. */
import { startServer, launchDriver, openHost } from './fixtures.mjs';

const server = await startServer();
const driver = await launchDriver('cdp');
try {
  const page = await openHost(driver, { window: 'w1', thread: 't1', width: 750, server });
  const r = await page.evaluate(async function () {
    function sleep(ms) { return new Promise(function (r2) { setTimeout(r2, ms); }); }
    var k3 = window.__k3;
    var out = {};
    // 1. route picker popover text
    var btn = document.querySelector('[data-testid="k3w-kit-model"]');
    btn.click();
    await sleep(400);
    var pop = document.querySelector('.k3-pop');
    out.popText = pop ? (pop.textContent || '').replace(/\s+/g, ' ').slice(0, 500) : 'NO POP';
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(250);
    // 2. lens menu + receipt
    var lensBtn = document.querySelector('[data-testid="k3-lens-button"]');
    out.lensBtn = !!lensBtn;
    lensBtn.click();
    await sleep(300);
    out.lensItems = Array.from(document.querySelectorAll('.k3-menu-item')).map(function (b) { return b.textContent.trim(); });
    var item = Array.from(document.querySelectorAll('.k3-menu-item')).find(function (b) { return /admission receipt/i.test(b.textContent); });
    out.receiptItem = !!item;
    if (item) {
      item.click();
      await sleep(500);
      out.receiptPanel = !!document.querySelector('[data-testid="k3-lens-receipt"], .k3l-receipt');
      out.receiptErr = null;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(200);
    // 3. approval card on thread-16
    k3.store.set('activeThreadId', 'thread-16');
    window.K3.emit('data', { type: 'threads-changed' });
    await sleep(400);
    var card = document.querySelector('[class*="k3a"]');
    out.approvalFound = !!card;
    out.approvalButtons = card ? Array.from(card.querySelectorAll('button')).map(function (b) { return b.textContent.trim(); }) : [];
    // 4. demo triggerQuestionFlow signature probe
    out.demoMethods = window.K3Demo ? Object.keys(window.K3Demo).slice(0, 50) : 'NO K3Demo';
    try {
      var q = k3.data.activeQuestionnaire('thread-16');
      out.activeQ = q ? q.id : null;
      if (window.K3Demo && window.K3Demo.triggerQuestionFlow) {
        var res = window.K3Demo.triggerQuestionFlow('thread-16');
        out.triggerResult = String(res).slice(0, 80);
      }
    } catch (e) { out.triggerErr = String(e).slice(0, 160); }
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await page.close();
} finally {
  await driver.close();
  server.proc.kill();
}
