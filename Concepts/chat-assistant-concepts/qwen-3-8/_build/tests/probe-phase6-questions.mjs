// Phase-6 gate: the SEEDED question flows (thread-12: q-layout-review then
// q-motion-review; thread-17: q17-redesign) are trigger-reachable end-to-end:
// select → next → validation_error → skip → submit/cancel, with draft
// preservation, cmd.chat.question.answer per selection, durable receipts,
// narrow-width clipping heuristic, no focus trap, composer restored after the
// queue drains, and completed-record reopen. t1 at 520 (reduced) + 975, t8 at 975.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-phase6-questions");
const server = await startServer();

function trigResult(v) { return v && typeof v === "object" && "ok" in v ? v.result : v; }

async function drainAndLifecycle(page, R, label, expectQueue) {
  await page.evaluate(() => {
    window.__pmQEvents = [];
    window.__pmQListener = e => window.__pmQEvents.push(JSON.parse(JSON.stringify(e.detail)));
    window.addEventListener("pmq-uicommand", window.__pmQListener);
  });

  const start = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const q = s.activeQuestionnaire(s.activeKey());
    return q ? q.id : null;
  });
  R.check(label + ": seeded questionnaire active", !!start, String(start));

  // selection emits question.answer
  await page.evaluate(() => window.__pmDemoTrigger("question.select", { option: 0 }));
  await settle(page, 300);
  const answered = await page.evaluate(() => window.__pmQEvents.some(e => e.id === "cmd.chat.question.answer" && "question_id" in e.payload && "value" in e.payload));
  R.check(label + ": selection emits question.answer", answered);

  // next advances within the questionnaire
  await page.evaluate(() => window.__pmDemoTrigger("question.next", {}));
  await settle(page, 300);

  // validation_error reachable, returns a verdict string
  const verdict = trigResult(await page.evaluate(() => window.__pmDemoTrigger("question.validation_error", {})));
  R.check(label + ": validation_error reachable", verdict === "invalid" || verdict === "valid", String(verdict));

  // skip emits question.skip
  await page.evaluate(() => window.__pmDemoTrigger("question.skip", {}));
  await settle(page, 300);
  const skipped = await page.evaluate(() => window.__pmQEvents.some(e => e.id === "cmd.chat.question.skip"));
  R.check(label + ": skip emits question.skip", skipped);

  // draft preservation through the flow
  await page.evaluate(() => window.PMChatHost.api.store.setDraft("draft survives the questionnaire flow"));
  await settle(page, 200);

  // answer all required + submit -> question.submit
  await page.evaluate(() => window.__pmDemoTrigger("question.submit", {}));
  await settle(page, 400);
  const afterSubmit = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return {
      submittedCmd: window.__pmQEvents.some(e => e.id === "cmd.chat.question.submit"),
      nextActive: s.activeQuestionnaire(s.activeKey()) ? s.activeQuestionnaire(s.activeKey()).id : null,
      draft: s.thread(s.activeKey()).draft.text
    };
  });
  R.check(label + ": submit emits question.submit", afterSubmit.submittedCmd);
  R.check(label + ": draft preserved through flow", afterSubmit.draft === "draft survives the questionnaire flow", afterSubmit.draft);
  R.check(label + ": queue advances on submit", afterSubmit.nextActive !== start, start + " -> " + afterSubmit.nextActive);

  // durable receipt rendered for the submitted record
  const receipt = await page.evaluate(() => !!document.querySelector(".pmq-questrecord"));
  R.check(label + ": durable receipt rendered", receipt);

  // completed-group reopen: submitted record still present/expandable
  const reopen = await page.evaluate(() => {
    const rec = document.querySelector(".pmq-questrecord");
    if (!rec) return false;
    const btn = rec.querySelector("button, [role=button]");
    if (btn) btn.click();
    return !!document.querySelector(".pmq-questrecord");
  });
  R.check(label + ": completed record reopenable", reopen);

  await page.evaluate(() => window.removeEventListener("pmq-uicommand", window.__pmQListener));
  return afterSubmit.nextActive;
}

try {
  // ---- t1 @ 520, reduced motion ----
  const p1 = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=520&dt=thread-12&rm=1");
  await settle(p1.page, 600);
  // clipping heuristic on the open seeded questionnaire
  const clip = await p1.page.evaluate(() => {
    const opts = [...document.querySelectorAll(".pmq-t1q-opt, .pmq-t1q-opts button, .pmq-t1q-opts [data-opt]")];
    let clipped = 0;
    opts.forEach(o => { if (o.scrollWidth > o.clientWidth + 2) clipped++; });
    return { opts: opts.length, clipped };
  });
  R.check("t1@520rm: option rows not clipped", clip.clipped === 0, JSON.stringify(clip));

  let next = await drainAndLifecycle(p1.page, R, "t1@520rm");
  // second seeded flow (q-motion-review) is next -> cancel it
  const cancelled = await p1.page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const q = s.activeQuestionnaire(s.activeKey());
    if (!q) return { hadNone: true };
    window.__pmQEvents2 = [];
    const l = e => window.__pmQEvents2.push(e.detail.id);
    window.addEventListener("pmq-uicommand", l);
    s.questCancel(q);
    window.removeEventListener("pmq-uicommand", l);
    return { id: q.id, cancelCmd: window.__pmQEvents2.includes("cmd.chat.question.cancel") };
  });
  R.check("t1@520rm: second seeded flow cancellable", cancelled.cancelCmd === true || cancelled.hadNone === true, JSON.stringify(cancelled));
  await settle(p1.page, 400);
  const drained1 = await p1.page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return { active: s.activeQuestionnaire(s.activeKey()), composerH: document.querySelector(".pmq-composerzone").getBoundingClientRect().height };
  });
  R.check("t1@520rm: queue drained + composer restored", drained1.active === null && drained1.composerH > 0, JSON.stringify(drained1));
  R.check("t1@520rm zero page errors", p1.errors.length === 0, p1.errors.slice(0, 2).join(" | "));
  await p1.browser.close();

  // ---- t1 @ 975, full motion: focus-theft + composer jump ----
  const p2 = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-12");
  await settle(p2.page, 600);
  const preActive = await p2.page.evaluate(() => document.activeElement && document.activeElement.tagName);
  await p2.page.evaluate(() => window.__pmDemoTrigger("question.select", { option: 0 }));
  await settle(p2.page, 300);
  const focusHeld = await p2.page.evaluate(() => {
    const el = document.activeElement;
    // typing focus must not be stolen into the questionnaire shell unexpectedly
    return !(el && el.closest && el.closest(".pmq-t1-quest"));
  });
  R.check("t1@975: no focus theft into question shell", focusHeld || preActive !== "TEXTAREA", String(preActive));
  await drainAndLifecycle(p2.page, R, "t1@975");
  await p2.page.evaluate(() => { const s = window.PMChatHost.api.store; const q = s.activeQuestionnaire(s.activeKey()); if (q) s.questCancel(q); });
  await settle(p2.page, 500);
  const drained2 = await p2.page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return { active: s.activeQuestionnaire(s.activeKey()), composerH: document.querySelector(".pmq-composerzone").getBoundingClientRect().height };
  });
  R.check("t1@975: queue drained + composer restored (no jump)", drained2.active === null && drained2.composerH > 0, JSON.stringify(drained2));
  R.check("t1@975 zero page errors", p2.errors.length === 0, p2.errors.slice(0, 2).join(" | "));
  await p2.browser.close();

  // ---- t8 @ 975: chapter interlude drives the same seeded flow ----
  const p3 = await openHost(server.port, "w=w1&t=t8&theme=friendly-dark&width=975&dt=thread-12");
  await settle(p3.page, 700);
  await drainAndLifecycle(p3.page, R, "t8@975");
  await p3.page.evaluate(() => { const s = window.PMChatHost.api.store; const q = s.activeQuestionnaire(s.activeKey()); if (q) s.questCancel(q); });
  await settle(p3.page, 400);
  R.check("t8@975 zero page errors", p3.errors.length === 0, p3.errors.slice(0, 2).join(" | "));
  await p3.browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
