// Probe 4 — artifact workspace (packet §07).
// trigger artifact -> opens LEFT of chat, outside transcript rect (bounding-box
// assertion); scroll/draft preserved; switch artifact; loading -> ready ->
// updated (version bump) -> error -> retry; pin history simultaneously;
// coexistence no-overlap; close/reopen restores selection.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-artifact");
const server = await startServer();
const checks = [];
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=1200&dt=thread-17", { width: 1720 });
  await settle(page, 700);

  // seed a draft + record scroll position
  await page.evaluate(() => window.PMChatHost.api.store.setDraft("draft must survive artifact open"));
  await page.evaluate(() => { const sc = document.querySelector(".pmq-scroller"); if (sc) sc.scrollTop = 200; });
  await settle(page, 300);
  const before = await page.evaluate(() => ({
    scroll: document.querySelector(".pmq-scroller").scrollTop,
    draft: window.PMChatHost.api.store.thread("thread-17").draft.text
  }));

  // open artifact via trigger
  await page.evaluate(() => window.__pmDemoTrigger("artifact.ready", {}));
  await settle(page, 700);
  const geo = await page.evaluate(() => {
    const art = document.querySelector(".pmq-artws");
    const stream = document.querySelector(".pmq-stream");
    if (!art || !stream) return null;
    const a = art.getBoundingClientRect();
    const s = stream.getBoundingClientRect();
    return { left: a.left < s.left, outside: a.right <= s.left + 1, widths: { art: a.width, stream: s.width } };
  });
  checks.push(check("artifact opens LEFT of chat, outside transcript", !!geo && geo.left && geo.outside, JSON.stringify(geo)));

  const after = await page.evaluate(() => ({
    scroll: document.querySelector(".pmq-scroller").scrollTop,
    draft: window.PMChatHost.api.store.thread("thread-17").draft.text
  }));
  checks.push(check("scroll + draft preserved on open", after.draft === before.draft && Math.abs(after.scroll - before.scroll) < 60, JSON.stringify({ before, after })));

  // switch artifact
  const arts = await page.evaluate(() => window.PMChatHost.api.store.threadArtifacts("thread-17").map(a => a.id));
  await page.evaluate(() => window.__pmDemoTrigger("artifact.switch", { index: 1 }));
  await settle(page, 500);
  const switched = await page.evaluate(() => window.PMChatHost.api.store.artWs(window.PMChatHost.api.env.winId()).activeId);
  checks.push(check("artifact switch changes selection", switched === arts[1], switched));

  // state machine: loading -> ready (version bump) -> error -> retry
  await page.evaluate(() => window.__pmDemoTrigger("artifact.loading", {}));
  await settle(page, 300);
  const loading = await page.evaluate(() => window.PMChatHost.api.store.artStatusOf("thread-17", window.PMChatHost.api.store.artWs(window.PMChatHost.api.env.winId()).activeId));
  checks.push(check("artifact loading state", loading === "loading", loading));
  await page.evaluate(() => window.__pmDemoTrigger("artifact.ready", {}));
  await settle(page, 300);
  const readyV = await page.evaluate(() => window.PMChatHost.api.store.artEntry("thread-17", window.PMChatHost.api.store.artWs(window.PMChatHost.api.env.winId()).activeId));
  checks.push(check("artifact ready + version bump", readyV.status === "ready" && readyV.version >= 2, JSON.stringify(readyV)));
  await page.evaluate(() => window.__pmDemoTrigger("artifact.error", {}));
  await settle(page, 300);
  const errored = await page.evaluate(() => window.PMChatHost.api.store.artStatusOf("thread-17", window.PMChatHost.api.store.artWs(window.PMChatHost.api.env.winId()).activeId));
  checks.push(check("artifact error state", errored === "error", errored));
  // retry via the card button
  await page.evaluate(() => {
    const b = document.querySelector("[data-artretry]");
    if (b) b.click();
  });
  await settle(page, 400);
  const retried = await page.evaluate(() => {
    const st = window.PMChatHost.api.store.artStatusOf("thread-17", window.PMChatHost.api.store.artWs(window.PMChatHost.api.env.winId()).activeId);
    return st === "loading" || st === "ready";
  });
  checks.push(check("artifact retry recovers", retried));

  // coexistence with pinned history: no overlap
  await page.evaluate(() => window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), true));
  await settle(page, 700);
  const coexist = await page.evaluate(() => {
    const col = document.querySelector(".pmq-pincol");
    const art = document.querySelector(".pmq-artws");
    const stream = document.querySelector(".pmq-stream");
    if (!col || !art || !stream) return { missing: { col: !!col, art: !!art, stream: !!stream } };
    const overlap = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    const cr = col.getBoundingClientRect(), ar = art.getBoundingClientRect(), sr = stream.getBoundingClientRect();
    return { colArt: overlap(cr, ar), colStream: overlap(cr, sr), artStream: overlap(ar, sr) };
  });
  checks.push(check("pinned + artifact coexist without overlap", coexist && !coexist.colArt && !coexist.colStream && !coexist.artStream, JSON.stringify(coexist)));

  // close/reopen restores selection
  await page.evaluate(() => window.__pmDemoTrigger("artifact.close", {}));
  await settle(page, 400);
  await page.evaluate(() => window.__pmDemoTrigger("artifact.switch", { index: 1 }));
  await settle(page, 500);
  const restored = await page.evaluate(() => window.PMChatHost.api.store.artWs(window.PMChatHost.api.env.winId()).activeId);
  checks.push(check("close/reopen restores selection", restored === arts[1], restored));

  checks.push(check("zero page errors", errors.length === 0, errors.slice(0, 2).join(" | ")));
  await browser.close();
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-artifact", "t1/w1", "1200", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
