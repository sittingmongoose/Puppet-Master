// Phase-5 gate: v3 thread surfaces — port 3000 card wording + Use 3001 resolution,
// capacity forecast card, cross-project grant card, attachment resolver flow
// (consent order), BSD cards, receipts, offline composer queueing, and artifact
// cards present on all eight thread concepts.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-phase5-surfaces");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17");
  await settle(page, 700);

  // Open t1 work disclosure so cards render
  const capsBtn = page.locator(".pmq-t1-workcaps").first();
  if (await capsBtn.count()) await capsBtn.evaluate(el => el.click());
  await settle(page, 500);

  // --- Port 3000 conflict card with packet wording ---
  const portInfo = await page.evaluate(() => {
    const card = document.querySelector(".pmq-port");
    if (!card) return null;
    return { text: card.textContent, has3000: card.textContent.includes("3000"), hasOwner: card.textContent.includes("checkout redesign") };
  });
  R.check("port 3000 card with owner wording", !!portInfo && portInfo.has3000 && portInfo.hasOwner, portInfo ? portInfo.text.slice(0, 90) : "missing");

  // --- Use 3001 resolves -> receipt + warning.resolve command ---
  await page.evaluate(() => {
    window.__pmP5Events = [];
    window.__pmP5Listener = e => window.__pmP5Events.push(JSON.parse(JSON.stringify(e.detail)));
    window.addEventListener("pmq-uicommand", window.__pmP5Listener);
    const b = document.querySelector(".pmq-port [data-portuse]");
    if (b) b.click();
  });
  await settle(page, 500);
  const portResolve = await page.evaluate(() => {
    window.removeEventListener("pmq-uicommand", window.__pmP5Listener);
    const ev = window.__pmP5Events;
    const ops = window.PMChatHost.api.store.operationalOf("thread-17");
    return {
      warned: ev.some(e => e.id === "cmd.chat.warning.resolve" && e.payload.kind === "collision"),
      portState: ops.ports.find(p => p.port === 3000).state,
      receipt: !!document.querySelector(".pmq-rx-port")
    };
  });
  R.check("Use 3001 resolves port + emits warning.resolve", portResolve.warned && portResolve.portState === "resolved", JSON.stringify(portResolve));
  R.check("port resolved receipt rendered", portResolve.receipt);

  // --- Capacity forecast card (packet shape) ---
  const capInfo = await page.evaluate(() => {
    const card = document.querySelector(".pmq-capacity");
    if (!card) return null;
    const t = card.textContent;
    return { text: t, ok: t.includes("6") && t.includes("2") && t.includes("3") && t.includes("provider allowance") && t.includes("forecast") };
  });
  R.check("capacity forecast card · packet shape", !!capInfo && capInfo.ok, capInfo ? capInfo.text.slice(0, 120) : "missing");

  // Start waves -> cmd.chat.crew.start? No — Start waves resolves the warning via warningAction
  await page.evaluate(() => {
    const b = document.querySelector(".pmq-capacity [data-cap='Start waves']");
    if (b) b.click();
  });
  await settle(page, 400);
  const capGone = await page.evaluate(() => ({
    card: !!document.querySelector(".pmq-capacity"),
    resolved: window.PMChatHost.api.store.thread("thread-17").warnings.find(w => w.kind === "capacity" && w.forecast).resolved
  }));
  R.check("Start waves resolves capacity warning", !capGone.card && !!capGone.resolved, JSON.stringify(capGone));

  // --- Cross-project grant card (dedicated, packet wording) ---
  const grantInfo = await page.evaluate(() => {
    const card = document.querySelector(".pmq-grant");
    if (!card) return null;
    const t = card.textContent;
    return {
      text: t,
      readWrite: t.includes("Read · Project A") && t.includes("Modify · Project B"),
      buttons: [...card.querySelectorAll("[data-grant]")].map(b => b.textContent)
    };
  });
  R.check("cross-project grant card · read/write + scopes", !!grantInfo && grantInfo.readWrite && grantInfo.buttons.includes("Allow for this Goal") && grantInfo.buttons.includes("Open Settings"), grantInfo ? grantInfo.buttons.join("|") : "missing");
  await page.evaluate(() => {
    const b = document.querySelector(".pmq-grant [data-grant='Allow once']");
    if (b) b.click();
  });
  await settle(page, 400);
  const grantDone = await page.evaluate(() => {
    const w = window.PMChatHost.api.store.thread("thread-17").warnings.find(x => x.kind === "cross-project");
    return { resolved: w.resolved, grantGone: !document.querySelector(".pmq-grant") };
  });
  R.check("grant Allow once resolves card", grantDone.resolved === "allow-once" && grantDone.grantGone, JSON.stringify(grantDone));

  // --- Attachment resolver: consent must precede alternate-route command ---
  const attachInfo = await page.evaluate(() => {
    const card = document.querySelector(".pmq-attachres");
    if (!card) return null;
    return {
      text: card.textContent,
      badge: card.querySelector(".pmq-ar-badge") ? card.querySelector(".pmq-ar-badge").textContent : "",
      buttons: [...card.querySelectorAll("[data-aract]")].map(b => b.textContent)
    };
  });
  R.check("attachment resolver card · unsupported + 3 buttons", !!attachInfo && attachInfo.badge === "Unsupported" && attachInfo.buttons.length === 3, JSON.stringify(attachInfo));
  await page.evaluate(() => {
    window.__pmP5Events = [];
    window.__pmP5Listener = e => window.__pmP5Events.push(JSON.parse(JSON.stringify(e.detail)));
    window.addEventListener("pmq-uicommand", window.__pmP5Listener);
    const b = document.querySelector(".pmq-attachres [data-aract='alternate']");
    if (b) b.click();
  });
  await settle(page, 400);
  const consentStep = await page.evaluate(() => {
    const ev = window.__pmP5Events;
    return {
      noPrematureRouteCmd: !ev.some(e => e.id === "cmd.chat.attachment.resolve" || e.id === "cmd.chat.attachment.route"),
      consentWarn: !!document.querySelector(".pmq-warning")
    };
  });
  R.check("Use Gemini opens consent first, no premature command", consentStep.noPrematureRouteCmd && consentStep.consentWarn, JSON.stringify(consentStep));
  const consentResult = await page.evaluate(() => {
    const b = document.querySelector('.pmq-warning [data-wract="Consent once"]');
    if (b) b.click();
    return null;
  });
  await settle(page, 400);
  const afterConsent = await page.evaluate(() => {
    window.removeEventListener("pmq-uicommand", window.__pmP5Listener);
    const ev = window.__pmP5Events;
    const route = window.PMChatHost.api.store.thread("thread-17").attachRoutes["screen-capture.mp4"];
    return {
      resolveCmd: ev.some(e => e.id === "cmd.chat.attachment.resolve" && e.payload.route === "alternate"),
      routeCmd: ev.some(e => e.id === "cmd.chat.attachment.route" && e.payload.target === "Gemini"),
      route: route ? route.route : null, consented: route ? route.consented : false
    };
  });
  R.check("Consent once fires resolve+route commands", afterConsent.resolveCmd && afterConsent.routeCmd && afterConsent.route === "alternate" && afterConsent.consented, JSON.stringify(afterConsent));

  // --- BSD advice card (seeded bsdAdvice + bsdEvents) ---
  const bsdInfo = await page.evaluate(() => ({
    advice: !!document.querySelector(".pmq-bsd-advice"),
    events: document.querySelectorAll(".pmq-bsd-event").length
  }));
  R.check("BSD advice card + events render", bsdInfo.advice && bsdInfo.events === 2, JSON.stringify(bsdInfo));

  // --- Receipts: restore point + replayed rows ---
  await page.evaluate(() => window.PMChatHost.api.store.restorePointCreate("thread-17", null));
  await settle(page, 400);
  const rpReceipt = await page.evaluate(() => !!document.querySelector(".pmq-rx-rp"));
  // --- Offline composer queueing (thread-18 has no active questionnaire, so
  // the composer is visible) ---
  await page.evaluate(() => window.PMChatHost.api.store.switchThread("thread-18"));
  await settle(page, 500);
  await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
  await settle(page, 400);
  const ta = page.locator(".pmq-composer-input").first();
  await ta.fill("queued while offline");
  await settle(page, 200);
  await page.evaluate(() => {
    const b = document.querySelector("[data-sendstop]");
    if (b) b.click();
  });
  await settle(page, 400);
  const queued = await page.evaluate(() => ({
    outbox: window.PMChatHost.api.store.state.connection.outbox.length,
    queuedMsgs: window.PMChatHost.api.store.messages("thread-18").filter(m => m.queuedReplay).length
  }));
  R.check("offline send queues into outbox", queued.outbox === 1 && queued.queuedMsgs === 0, JSON.stringify(queued));
  const offlineHint = await page.evaluate(() => {
    const h = document.querySelector(".pmq-hint-offline");
    return h ? !h.hidden : false;
  });
  R.check("offline hint visible", offlineHint);
  await page.evaluate(() => window.__pmDemoTrigger("conn.reconnect", {}));
  await settle(page, 500);
  const replayed = await page.evaluate(() => {
    const msgs = window.PMChatHost.api.store.messages("thread-18").filter(m => m.queuedReplay);
    return { count: msgs.length, body: msgs[0] ? msgs[0].body : "", receipt: !!document.querySelector(".pmq-rx-outbox") };
  });
  R.check("reconnect replays exactly once + receipt", replayed.count === 1 && replayed.body === "queued while offline" && replayed.receipt, JSON.stringify(replayed));

  // --- Artifact cards present on all eight thread concepts (thread-17 has artifacts) ---
  for (const m of ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]) {
    await page.goto(`http://127.0.0.1:${server.port}/host.html?w=w1&t=${m}&theme=friendly-dark&width=975&dt=thread-17`, { waitUntil: "load" });
    await page.waitForSelector(".pmq-msg", { timeout: 15000 });
    await settle(page, 600);
    // Open the artifacts surface for this concept's idiom.
    await page.evaluate((concept) => {
      const q = sel => document.querySelector(sel);
      if (concept === "t1") { const b = q(".pmq-t1-workcaps"); if (b) b.click(); }
      else if (concept === "t2") { const c = [...document.querySelectorAll(".pmq-t2-wchip")].find(x => x.dataset.domain === "artifacts"); if (c) c.click(); }
      else if (concept === "t3") { const r = [...document.querySelectorAll(".pmq-t3w-row")].find(x => x.dataset.t3w === "artifacts"); if (r) r.click(); }
      else if (concept === "t4") { const r = [...document.querySelectorAll(".pmq-t4w-row")].find(x => x.closest("[data-domain]") && x.closest("[data-domain]").dataset.domain === "artifacts"); if (r) r.click(); }
      else if (concept === "t5") { const c = [...document.querySelectorAll(".pmq-t5w-chip")].find(x => x.dataset.domain === "artifacts"); if (c) c.click(); }
      else if (concept === "t6") { const b = q(".pmq-t6work-row"); if (b) b.click(); }
      else if (concept === "t7") { const h = [...document.querySelectorAll("[data-t7toggle]")].find(x => x.dataset.t7toggle === "artifacts"); if (h) h.click(); }
      else if (concept === "t8") { const h = [...document.querySelectorAll("[data-wltoggle]")].find(x => x.dataset.wltoggle === "artifacts"); if (h) h.click(); }
    }, m);
    await settle(page, 600);
    const hasArt = await page.evaluate(() => ({
      artCards: document.querySelectorAll(".pmq-artifacts, .pmq-art-row").length,
      builders: window.PMChatHost.api.store.threadArtifacts("thread-17").length
    }));
    R.check(`${m} renders artifact cards`, hasArt.artCards > 0, "cards=" + hasArt.artCards + " artifacts=" + hasArt.builders);
  }

  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
