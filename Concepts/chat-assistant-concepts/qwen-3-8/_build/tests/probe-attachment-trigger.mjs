// Live-scenario regression: attachment.unsupported must render the resolver
// card on ANY thread (not just fixture-seeded Thread-17). Fire the trigger on
// the unseeded thread-02, open the work composition, and assert the card shows
// the Unsupported badge, lineage, and the three action buttons; then verify
// Cancel removes it and Extract routes it.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-attachment-trigger");
const server = await startServer();
const checks = [];
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-02");
  await settle(page, 650);

  // thread-02 has no seeded attachments or routes
  const baseline = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return { draft: s.thread("thread-02").draft.attachments.length, routes: Object.keys(s.thread("thread-02").attachRoutes).length };
  });
  checks.push(check("thread-02 starts without attachments/routes", baseline.draft === 0 && baseline.routes === 0, JSON.stringify(baseline)));

  // fire the trigger on the unseeded thread
  await page.evaluate(() => window.__pmDemoTrigger("attachment.unsupported", {}));
  await settle(page, 450);

  const routed = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const st = s.thread("thread-02");
    return { draft: st.draft.attachments.includes("att-demo-video"), route: st.attachRoutes["att-demo-video"] ? st.attachRoutes["att-demo-video"].route : null };
  });
  checks.push(check("trigger adds attachment to live draft + route", routed.draft === true && routed.route === "unsupported", JSON.stringify(routed)));

  // open the t1 work disclosure so resolver cards mount
  await page.evaluate(() => { const b = document.querySelector(".pmq-t1-workcaps"); if (b) b.click(); });
  await settle(page, 500);

  const card = await page.evaluate(() => {
    const el = document.querySelector(".pmq-attachres");
    if (!el) return null;
    return {
      name: el.querySelector(".pmq-ar-name") ? el.querySelector(".pmq-ar-name").textContent : "",
      badge: el.querySelector(".pmq-ar-badge") ? el.querySelector(".pmq-ar-badge").textContent : "",
      lineage: el.querySelector(".pmq-ar-lineage") ? el.querySelector(".pmq-ar-lineage").textContent : "",
      buttons: [...el.querySelectorAll("[data-aract]")].map(b => b.textContent)
    };
  });
  checks.push(check("resolver card renders on unseeded thread", !!card && card.badge === "Unsupported", JSON.stringify(card)));
  checks.push(check("resolver shows lineage + 3 buttons", !!card && card.lineage.includes("att-demo-video") && card.buttons.length === 3, card ? card.buttons.join("|") : "missing"));

  // Extract routes it pm-transformed and starts a job
  await page.evaluate(() => { const b = document.querySelector('.pmq-attachres [data-aract="extract"]'); if (b) b.click(); });
  await settle(page, 400);
  const extracted = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const r = s.thread("thread-02").attachRoutes["att-demo-video"];
    return r ? { route: r.route, job: r.job ? r.job.state : null } : null;
  });
  checks.push(check("Extract in PM routes + starts job", extracted && extracted.route === "pm-transformed" && extracted.job === "running", JSON.stringify(extracted)));

  // Cancel on a fresh trigger removes the attachment entirely
  await page.evaluate(() => window.__pmDemoTrigger("attachment.unsupported", {}));
  await settle(page, 400);
  await page.evaluate(() => { const b = document.querySelector('.pmq-attachres [data-aract="cancel"]'); if (b) b.click(); });
  await settle(page, 400);
  const cancelled = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const st = s.thread("thread-02");
    return { inDraft: st.draft.attachments.includes("att-demo-video"), hasRoute: !!st.attachRoutes["att-demo-video"] };
  });
  checks.push(check("Cancel removes attachment + route", cancelled.inDraft === false && cancelled.hasRoute === false, JSON.stringify(cancelled)));

  checks.push(check("zero page errors", errors.length === 0, errors.slice(0, 2).join(" | ")));
  await browser.close();
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-attachment-trigger", "thread-02", "975", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
