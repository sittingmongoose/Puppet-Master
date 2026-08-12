// Probe 6 — offline idempotency (packet §05/§07).
// conn.offline -> type+send twice -> 2 queued rows -> conn.reconnect ->
// each appears exactly once in transcript -> no duplicate pmq-msg per outbox
// id -> sync strip back to Live -> reload mid-offline preserves outbox.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-offline");
const server = await startServer();
const checks = [];
try {
  const url = `w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-18`;
  const { browser, page, errors } = await openHost(server.port, url);
  await settle(page, 600);

  await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
  await settle(page, 300);
  await page.evaluate(() => window.__pmDemoTrigger("conn.queue_send", { text: "offline message one" }));
  await page.evaluate(() => window.__pmDemoTrigger("conn.queue_send", { text: "offline message two" }));
  await settle(page, 300);
  const queuedRows = await page.evaluate(() => {
    const ob = window.PMChatHost.api.store.state.connection.outbox;
    return ob.map(e => ({ id: e.id, text: e.draft.text, sentOnce: e.sentOnce }));
  });
  checks.push(check("2 queued outbox rows while offline", queuedRows.length === 2 && queuedRows.every(e => !e.sentOnce), JSON.stringify(queuedRows)));

  await page.evaluate(() => window.__pmDemoTrigger("conn.reconnect", {}));
  await settle(page, 500);
  const replayed = await page.evaluate(() => {
    const msgs = window.PMChatHost.api.store.messages("thread-18").filter(m => m.queuedReplay);
    const byId = {};
    msgs.forEach(m => { byId[m.id] = (byId[m.id] || 0) + 1; });
    return { total: msgs.length, unique: Object.keys(byId).length, dups: Object.values(byId).filter(n => n > 1).length, status: window.PMChatHost.api.store.state.connection.status };
  });
  checks.push(check("each queued msg appears exactly once", replayed.total === 2 && replayed.unique === 2 && replayed.dups === 0, JSON.stringify(replayed)));
  checks.push(check("sync strip back to Live", replayed.status === "live", replayed.status));

  // no duplicate rendered rows for the same outbox id
  const renderedDups = await page.evaluate(() => {
    const texts = [...document.querySelectorAll(".pmq-msg")].map(m => (m.textContent || "").trim()).filter(t => t.includes("offline message"));
    const one = texts.filter(t => t.includes("offline message one")).length;
    const two = texts.filter(t => t.includes("offline message two")).length;
    return { one, two };
  });
  checks.push(check("no duplicate rendered rows per outbox id", renderedDups.one === 1 && renderedDups.two === 1, JSON.stringify(renderedDups)));

  // reload mid-offline: outbox persists
  await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
  await page.evaluate(() => window.__pmDemoTrigger("conn.queue_send", { text: "survives reload" }));
  await page.evaluate(() => new Promise(r => setTimeout(r, 450))); // let persist debounce flush
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".pmq-msg", { timeout: 15000 });
  await settle(page, 600);
  const persisted = await page.evaluate(() => ({
    status: window.PMChatHost.api.store.state.connection.status,
    outbox: window.PMChatHost.api.store.state.connection.outbox.map(e => e.draft.text)
  }));
  checks.push(check("reload mid-offline preserves outbox + status", persisted.status === "offline" && persisted.outbox.includes("survives reload"), JSON.stringify(persisted)));

  checks.push(check("zero page errors", errors.length === 0, errors.slice(0, 2).join(" | ")));
  await browser.close();
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-offline", "thread-18", "975", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
