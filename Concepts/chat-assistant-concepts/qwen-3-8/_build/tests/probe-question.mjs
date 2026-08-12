// Probe 2 — question flow semantics (packet §07).
// Draft intact through the flow; answer / skip / second input type / cancel /
// submit; durable receipt; focus + draft recovery. t1 + t8 at 520 & 975,
// reduced motion on/off.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-question");
const server = await startServer();
const checks = [];
const cases = [
  { t: "t1", width: 520, rm: 1 },
  { t: "t1", width: 975, rm: 0 },
  { t: "t8", width: 520, rm: 1 },
  { t: "t8", width: 975, rm: 0 }
];

async function flow(page, checks, label) {
  // seed draft BEFORE the flow
  await page.evaluate(() => window.PMChatHost.api.store.setDraft("probe draft " + Math.random().toString(36).slice(2)));
  await settle(page, 200);
  const draftBefore = await page.evaluate(() => window.PMChatHost.api.store.thread(window.PMChatHost.api.store.activeKey()).draft.text);

  await page.evaluate(() => {
    window.__pmQE = [];
    window.__pmQL = e => window.__pmQE.push(JSON.parse(JSON.stringify(e.detail)));
    window.addEventListener("pmq-uicommand", window.__pmQL);
  });

  const q0 = await page.evaluate(() => { const q = window.PMChatHost.api.store.activeQuestionnaire(window.PMChatHost.api.store.activeKey()); return q ? q.id : null; });
  checks.push(check(label + ": seeded flow active", !!q0, String(q0)));

  // answer (single select), then next, then freeform input type if present
  await page.evaluate(() => window.__pmDemoTrigger("question.select", { option: 0 }));
  await settle(page, 300);
  await page.evaluate(() => window.__pmDemoTrigger("question.next", {}));
  await settle(page, 300);
  // second input type: freeform if available on current question
  await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const q = s.activeQuestionnaire(s.activeKey());
    if (!q) return;
    const idx = s.questIndex(q, s.activeKey());
    const cur = q.questions[idx];
    if (cur && cur.kind === "freeform") s.questSetAnswer(q, cur, "typed freeform note");
  });
  await settle(page, 200);

  // skip
  await page.evaluate(() => window.__pmDemoTrigger("question.skip", {}));
  await settle(page, 300);
  // submit
  await page.evaluate(() => window.__pmDemoTrigger("question.submit", {}));
  await settle(page, 400);

  const out = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const ev = window.__pmQE;
    return {
      answer: ev.some(e => e.id === "cmd.chat.question.answer"),
      skip: ev.some(e => e.id === "cmd.chat.question.skip"),
      submit: ev.some(e => e.id === "cmd.chat.question.submit"),
      draftAfter: s.thread(s.activeKey()).draft.text,
      receipt: !!document.querySelector(".pmq-questrecord")
    };
  });
  checks.push(check(label + ": answer+skip+submit emitted", out.answer && out.skip && out.submit));
  checks.push(check(label + ": draft intact through flow", out.draftAfter === draftBefore, out.draftAfter));
  checks.push(check(label + ": durable receipt", out.receipt));

  // cancel remaining flow(s), focus returns (not trapped), draft still there
  await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    let q = s.activeQuestionnaire(s.activeKey());
    while (q) { s.questCancel(q); q = s.activeQuestionnaire(s.activeKey()); }
  });
  await settle(page, 400);
  const tail = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const el = document.activeElement;
    return {
      none: s.activeQuestionnaire(s.activeKey()) === null,
      cancelCmd: window.__pmQE.some(e => e.id === "cmd.chat.question.cancel"),
      trapped: !!(el && el.closest && el.closest(".pmq-t1-quest, .pmq-t8-quest, [class*=quest]")),
      draftStill: s.thread(s.activeKey()).draft.text
    };
  });
  checks.push(check(label + ": cancel drains + no focus trap", tail.none && !tail.trapped, JSON.stringify(tail)));
  checks.push(check(label + ": draft recovery after drain", tail.draftStill === draftBefore));
  await page.evaluate(() => window.removeEventListener("pmq-uicommand", window.__pmQL));
}

try {
  for (const c of cases) {
    const rmParam = c.rm ? "&rm=1" : "";
    const { browser, page, errors } = await openHost(server.port, `w=w1&t=${c.t}&theme=friendly-dark&width=${c.width}&dt=thread-12${rmParam}`);
    await settle(page, 650);
    await flow(page, checks, `${c.t}@${c.width}${c.rm ? "-rm" : ""}`);
    checks.push(check(`${c.t}@${c.width}${c.rm ? "-rm" : ""} zero page errors`, errors.length === 0, errors.slice(0, 2).join(" | ")));
    await browser.close();
  }
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-question", "t1/t8", "520/975", "friendly-dark", "on/off", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
