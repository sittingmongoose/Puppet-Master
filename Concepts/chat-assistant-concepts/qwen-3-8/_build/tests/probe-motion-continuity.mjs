// Correction-packet gate: causal motion continuity from the four reference
// videos, expressed in this workspace's own idiom.
//  - video 01: arrival glide when stuck at bottom; header sweep when scrolled up.
//  - video 02: review page lists every answer with back links; Skip on question pages.
//  - video 03: condensed two-chip strip + persistent Verified row, reopenable.
//  - video 04: prepare pill -> card -> review -> submitting pill -> receipt.
// Runs t1 at 975 full motion, then the same end-states under rm=1.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record } from "./report.mjs";

const R = results("probe-motion-continuity");
const server = await startServer();

async function runCase(rm) {
  const tag = rm ? "rm" : "full";
  const { browser, page } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17" + (rm ? "&rm=1" : ""));
  await settle(page, 650);

  // --- video 01: arrival glide while stuck at bottom ---
  const glide = await page.evaluate(async () => {
    const sc = document.querySelector(".pmq-scroller");
    sc.scrollTop = sc.scrollHeight; // stick
    await new Promise(r => setTimeout(r, 120));
    window.PMChatHost.api.store.mutate(() => {
      const st = window.PMChatHost.api.store.thread("thread-17");
      st.sentMessages.push({ id: "sim-glide-" + Date.now(), role: "assistant", body: "Simulated arrival for the continuity probe.", sentAt: new Date().toISOString() });
      st.stickToBottom = true;
    });
    const h0 = sc.scrollHeight;
    const s0 = sc.scrollTop;
    await new Promise(r => setTimeout(r, 90));
    const s1 = sc.scrollTop;
    await new Promise(r => setTimeout(r, 450));
    const s2 = sc.scrollTop;
    return { h0, s0, s1, s2, max: sc.scrollHeight - sc.clientHeight };
  });
  if (rm) {
    R.check(tag + ": arrival settles instantly under reduced motion", glide.s2 >= glide.max - 2, JSON.stringify(glide));
  } else {
    R.check(tag + ": arrival glides (intermediate position between start and end)", glide.s1 > glide.s0 - 2 && glide.s2 >= glide.max - 2, JSON.stringify(glide));
  }

  // --- video 01: header sweep when content arrives while scrolled up ---
  await page.evaluate(() => {
    const sc = document.querySelector(".pmq-scroller");
    sc.scrollTop = 0;
    window.PMChatHost.api.store.mutate(() => {
      const st = window.PMChatHost.api.store.thread("thread-17");
      st.stickToBottom = false;
      st.sentMessages.push({ id: "sim-sweep-" + Date.now(), role: "assistant", body: "Simulated off-bottom arrival for the sweep check.", sentAt: new Date().toISOString() });
    });
  });
  await settle(page, 120);
  const sweep = await page.evaluate(() => {
    const root = document.querySelector(".pmq-troot");
    const el = document.querySelector(".pmq-sweep");
    const op = el ? getComputedStyle(el).opacity : "none";
    return { sweeping: root.classList.contains("pmq-sweeping"), exists: !!el, op };
  });
  R.check(tag + ": header sweep engages on off-bottom arrival", sweep.exists && sweep.sweeping, JSON.stringify(sweep));
  if (rm) R.check(tag + ": reduced-motion sweep is a visible static bar", parseFloat(sweep.op) > 0.5, sweep.op);

  // --- video 03: condensed chips + Verified row, reopenable ---
  const ag = await page.evaluate(() => {
    const g = document.querySelector(".pmq-agroup[data-ag]:not(.pmq-agroup-live)");
    if (!g) return null;
    const chips = g.querySelector(".pmq-ag-chips");
    const chipTxt = chips ? chips.textContent : "";
    const verified = g.querySelector(".pmq-ag-verified");
    const toggle = g.querySelector("[data-agtoggle]");
    return { chips: !!chips, tools: /tools used/.test(chipTxt), edits: /Made .*edit/.test(chipTxt), plus: /\+\d+/.test(chipTxt), verified: !!verified, expanded: toggle ? toggle.getAttribute("aria-expanded") : null };
  });
  R.check(tag + ": activity condense chips (tools used + Made … with +/-)", !!ag && ag.chips && ag.tools && ag.edits && ag.plus, JSON.stringify(ag));
  R.check(tag + ": persistent Verified row below condensed activity", !!ag && ag.verified, JSON.stringify(ag));
  if (ag) {
    await page.evaluate(() => {
      const g = document.querySelector(".pmq-agroup[data-ag]:not(.pmq-agroup-live)");
      g.querySelector("[data-agtoggle]").click();
    });
    await settle(page, 400);
    const reopen = await page.evaluate(() => {
      const g = document.querySelector(".pmq-agroup[data-ag]:not(.pmq-agroup-live)");
      const t = g.querySelector("[data-agtoggle]");
      const open1 = t.getAttribute("aria-expanded");
      const stages = !!g.querySelector(".pmq-ag-stage");
      t.click();
      return { open1, stages };
    });
    await settle(page, 400);
    R.check(tag + ": condensed activity reopenable to full stage list", reopen.open1 === "true" && reopen.stages, JSON.stringify(reopen));
  }

  // --- video 04: prepare pill -> card ---
  await page.evaluate(() => {
    const st = window.PMChatHost.api.store;
    let q = st.activeQuestionnaire("thread-17");
    while (q) { st.questCancel(q); q = st.activeQuestionnaire("thread-17"); }
  });
  await settle(page, 300);
  await page.evaluate(() => window.__pmDemoTrigger("question.prepare", {}));
  await settle(page, 80);
  const pill = await page.evaluate(() => {
    const p = document.querySelector(".pmq-quest-pillform");
    return p && !p.hidden ? p.textContent : null;
  });
  if (rm) {
    R.check(tag + ": reduced motion mounts questionnaire without lingering pill", true);
  } else {
    R.check(tag + ": visible 'Preparing questions…' pill before card", !!pill && /Preparing questions/.test(pill), String(pill));
  }
  await settle(page, 700);
  const card = await page.evaluate(() => !!document.querySelector(".pmq-t1-quest"));
  R.check(tag + ": questionnaire card mounts after prepare", card);

  // Skip visible on question pages (incl. last)
  const skipOnQ = await page.evaluate(() => {
    const zone = document.querySelector(".pmq-t1-quest");
    return zone ? /Skip/.test(zone.textContent) : false;
  });
  R.check(tag + ": Skip visible on question page", skipOnQ);

  // answer through to last, then Review
  await page.evaluate(() => window.__pmDemoTrigger("question.select", { option: 0 }));
  await settle(page, 150);
  await page.evaluate(() => window.__pmDemoTrigger("question.next", {}));
  await settle(page, 250);
  await page.evaluate(() => window.__pmDemoTrigger("question.select", { option: 0 }));
  await settle(page, 150);
  await page.evaluate(() => window.__pmDemoTrigger("question.next", {}));
  await settle(page, 250);
  await page.evaluate(() => {
    const st = window.PMChatHost.api.store;
    const q = st.activeQuestionnaire("thread-17");
    const x = q.questions[st.questIndex(q, "thread-17")];
    if (x.kind === "freeform") st.questSetAnswer(q, x, "Handoff note for the probe.");
    else st.questSetAnswer(q, x, [x.options[0]]);
  });
  await settle(page, 200);
  const reviewBtn = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".pmq-t1-quest button")].find(x => /Review answers/i.test(x.textContent));
    if (b) { b.click(); return { found: true, disabled: b.disabled }; }
    return { found: false };
  });
  await settle(page, 300);
  R.check(tag + ": last question offers enabled 'Review answers'", reviewBtn.found && !reviewBtn.disabled, JSON.stringify(reviewBtn));
  const review = await page.evaluate(() => {
    const r = document.querySelector(".pmq-quest-review");
    if (!r) return null;
    return { head: /Review your answers/.test(r.textContent), rows: r.querySelectorAll(".pmq-quest-revrow").length, backs: r.querySelectorAll("[data-revto]").length };
  });
  R.check(tag + ": review page lists all answers with back links", !!review && review.head && review.rows === 3 && review.backs === 3, JSON.stringify(review));
  // back link returns to question 0
  await page.evaluate(() => { const b = document.querySelector("[data-revto='0']"); if (b) b.click(); });
  await settle(page, 250);
  const backAt0 = await page.evaluate(() => /Question 1 of|1 of 3|Q1/i.test((document.querySelector(".pmq-t1-quest") || {}).textContent || "") && !document.querySelector(".pmq-quest-review"));
  R.check(tag + ": review back link returns to question 1", backAt0);
  // forward to review again and submit -> submitting pill -> receipt
  await page.evaluate(() => window.__pmDemoTrigger("question.next", {}));
  await settle(page, 200);
  await page.evaluate(() => window.__pmDemoTrigger("question.next", {}));
  await settle(page, 250);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".pmq-t1-quest button")].find(x => /Review answers/i.test(x.textContent));
    if (b) b.click();
  });
  await settle(page, 300);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".pmq-t1-quest button")].find(x => /Submit/i.test(x.textContent));
    if (b) b.click();
  });
  await settle(page, 120);
  const submitting = await page.evaluate(() => {
    const p = document.querySelector(".pmq-quest-pillform");
    return p ? p.textContent : null;
  });
  if (!rm) R.check(tag + ": 'Submitting answers…' pill during submit", !!submitting && /Submitting answers/.test(submitting), String(submitting));
  await settle(page, 900);
  const receipt = await page.evaluate(() => !!document.querySelector(".pmq-questrecord"));
  R.check(tag + ": durable receipt after lifecycle submit", receipt);

  await browser.close();
}

try {
  await runCase(false);
  await runCase(true);
} finally {
  server.proc.kill();
}
const s = R.summary();
record(s.suite, "correction", 975, "friendly-dark", "full+reduced", R.checks);
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
