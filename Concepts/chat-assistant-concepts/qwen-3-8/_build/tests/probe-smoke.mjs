// Phase-0 smoke: static server + host page loads, one message rendered, zero page errors.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-smoke");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975");
  await settle(page, 600);
  const msgCount = await page.locator(".pmq-msg").count();
  R.check("host renders messages", msgCount > 0, "count=" + msgCount);
  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  const storeOk = await page.evaluate(() => !!(window.PMChatHost && window.PMChatHost.api && window.PMChatHost.api.store && window.PMChatHost.api.store.state));
  R.check("store instance booted", storeOk);
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
